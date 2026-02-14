const STORAGE_KEY = "ficha_cthulhu_v1";

const ATTRIBUTES = [
  "FOR", "CON", "DES", "APA", "POD", "INT", "TAM", "EDU"
];

const BASE_SKILLS = [
  { name: "Arrombar", base: 1 },
  { name: "Arte/Oficio", base: 5 },
  { name: "Biblioteca", base: 20 },
  { name: "Briga", base: 25 },
  { name: "Charme", base: 15 },
  { name: "Escutar", base: 20 },
  { name: "Esquiva", auto: "DES/2" },
  { name: "Furtividade", base: 20 },
  { name: "Intimidação", base: 15 },
  { name: "Lábia", base: 5 },
  { name: "Medicina", base: 1 },
  { name: "Ocultismo", base: 5 },
  { name: "Percepção", base: 25 },
  { name: "Persuasão", base: 10 },
  { name: "Primeiros Socorros", base: 30 },
  { name: "Psicologia", base: 10 },
  { name: "Rastrear", base: 10 }
];

const REQUESTED_SKILLS = [
  { name: "Arremessar", base: 20 },
  { name: "Arte/Oficio", base: 5 },
  { name: "Lança", base: 20 },
  { name: "Avaliação", base: 5 },
  { name: "Cavalgar", base: 5 },
  { name: "Charme", base: 15 },
  { name: "Engenhosidade", base: 5 },
  { name: "Disfarce", base: 5 },
  { name: "Encontrar", base: 25 },
  { name: "Escutar", base: 20 },
  { name: "Escalar", base: 20 },
  { name: "Esquiva", auto: "DES/2" },
  { name: "Lábia", base: 5 },
  { name: "Intimidação", base: 15 },
  { name: "História", base: 5 },
  { name: "Furtividade", base: 20 },
  { name: "Língua Natural", auto: "EDU" },
  { name: "Língua Outra", base: 1 },
  { name: "Lutar (Brigar)", base: 25 },
  { name: "Medicina", base: 1 },
  { name: "Mundo Natural", base: 10 },
  { name: "Natação", base: 20 },
  { name: "Navegação", base: 10 },
  { name: "Nível de Crédito", base: 0 },
  { name: "Ocultismo", base: 5 },
  { name: "Persuasão", base: 10 },
  { name: "Predigitação", base: 10 },
  { name: "Primeiros Socorros", base: 30 },
  { name: "Psicologia", base: 10 },
  { name: "Saltar", base: 20 },
  { name: "Rastrear", base: 10 },
  { name: "Sobrevivência", base: 10 },
  { name: "Biblioteca", base: 20 }
];

function normalizeSkillName(name) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function mergeSkills(baseSkills, requestedSkills) {
  const unique = new Map();

  [...baseSkills, ...requestedSkills].forEach((skill) => {
    const key = normalizeSkillName(skill.name);
    if (!unique.has(key)) {
      unique.set(key, skill);
    }
  });

  return Array.from(unique.values());
}

const SKILLS = mergeSkills(BASE_SKILLS, REQUESTED_SKILLS);

const form = document.getElementById("sheetForm");
const attributesList = document.getElementById("attributesList");
const skillsList = document.getElementById("skillsList");
const statusEl = document.getElementById("status");
const WEAPON_ROWS = 4;

function makeReadonlyValue(initial = "-") {
  const span = document.createElement("span");
  span.className = "value-display";
  span.textContent = initial;
  return span;
}

function calcHalf(value) {
  return Math.floor(value / 2);
}

function calcFifth(value) {
  return Math.floor(value / 5);
}

function buildAttributes() {
  ATTRIBUTES.forEach((attr) => {
    const row = document.createElement("div");
    row.className = "attribute-row";

    const name = document.createElement("span");
    name.textContent = attr;

    const input = document.createElement("input");
    input.type = "number";
    input.name = `attr_${attr}`;
    input.min = "1";
    input.max = "99";

    const half = makeReadonlyValue();
    const fifth = makeReadonlyValue();

    input.addEventListener("input", () => {
      const value = Number(input.value || 0);
      half.textContent = value ? String(calcHalf(value)) : "-";
      fifth.textContent = value ? String(calcFifth(value)) : "-";
      updateDerivedStats();
    });

    row.append(name, input, half, fifth);
    attributesList.appendChild(row);
  });
}

function baseLabel(skill) {
  if (skill.auto) {
    return skill.auto;
  }
  return `${skill.base}%`;
}

function getSkillBaseValue(skill) {
  if (typeof skill.base === "number") {
    return skill.base;
  }
  return 0;
}

function applySkillDerived(input, half, fifth) {
  const value = Number(input.value || 0);
  half.textContent = String(calcHalf(value));
  fifth.textContent = String(calcFifth(value));
}

function buildSkills() {
  SKILLS.forEach((skill) => {
    const row = document.createElement("div");
    row.className = "skill-row";

    const name = document.createElement("span");
    name.textContent = `${skill.name} (${baseLabel(skill)})`;

    const input = document.createElement("input");
    input.type = "number";
    input.name = `skill_${skill.name}`;
    input.min = "0";
    input.max = "99";
    input.value = getSkillBaseValue(skill);

    if (skill.auto) {
      input.readOnly = true;
    }

    const half = makeReadonlyValue(String(calcHalf(getSkillBaseValue(skill))));
    const fifth = makeReadonlyValue(String(calcFifth(getSkillBaseValue(skill))));

    input.addEventListener("input", () => {
      applySkillDerived(input, half, fifth);
    });

    row.append(name, input, half, fifth);
    skillsList.appendChild(row);
  });
}

function getAttr(name) {
  return Number(form.elements[`attr_${name}`]?.value || 0);
}

function calcMove(str, des, tam) {
  if (!str || !des || !tam) {
    return "";
  }

  const higherThanTamCount = Number(str > tam) + Number(des > tam);

  if (higherThanTamCount === 2) {
    return 9;
  }

  if (higherThanTamCount === 1) {
    return 8;
  }

  return 7;
}

function updateDerivedStats() {
  const str = getAttr("FOR");
  const con = getAttr("CON");
  const des = getAttr("DES");
  const tam = getAttr("TAM");
  const pod = getAttr("POD");

  const hp = Math.floor((con + tam) / 10);
  const mp = Math.floor(pod / 5);
  const mov = calcMove(str, des, tam);

  form.elements.pv.value = hp || "";
  form.elements.pm.value = mp || "";
  form.elements.mov.value = mov;
  form.elements.mov.readOnly = true;

  const sanEl = form.elements.san;
  if (!sanEl.value) {
    sanEl.value = pod || "";
  }

  updateUnarmedFromStrength();
  updateAutoSkills();
}

function updateUnarmedFromStrength() {
  const str = getAttr("FOR");
  const regular = form.elements.arma_1_regular;

  if (!regular) {
    return;
  }

  regular.readOnly = true;
  regular.value = str || 0;
  updateWeaponThresholds(1);
}

function updateWeaponThresholds(rowIndex) {
  const regular = form.elements[`arma_${rowIndex}_regular`];
  const difficult = form.elements[`arma_${rowIndex}_dificil`];
  const extreme = form.elements[`arma_${rowIndex}_extremo`];

  if (!regular || !difficult || !extreme) {
    return;
  }

  const hasValue = regular.value !== "";
  const regularValue = Number(regular.value || 0);

  difficult.readOnly = true;
  extreme.readOnly = true;
  difficult.value = hasValue ? calcHalf(regularValue) : "";
  extreme.value = hasValue ? calcFifth(regularValue) : "";
}

function initWeaponAutoThresholds() {
  for (let i = 1; i <= WEAPON_ROWS; i += 1) {
    const regular = form.elements[`arma_${i}_regular`];
    if (!regular) {
      continue;
    }

    regular.addEventListener("input", () => {
      updateWeaponThresholds(i);
    });

    updateWeaponThresholds(i);
  }
}

function updateAutoSkills() {
  const des = getAttr("DES");
  const edu = getAttr("EDU");

  const esquiva = form.elements["skill_Esquiva"];
  if (esquiva) {
    esquiva.value = des ? Math.floor(des / 2) : 0;
    esquiva.dispatchEvent(new Event("input", { bubbles: true }));
  }

  const linguaNatural = form.elements["skill_Língua Natural"];
  if (linguaNatural) {
    linguaNatural.value = edu || 0;
    linguaNatural.dispatchEvent(new Event("input", { bubbles: true }));
  }
}

function saveSheet() {
  const data = {};
  const elements = Array.from(form.elements);

  elements.forEach((el) => {
    if (!el.name) {
      return;
    }
    data[el.name] = el.value;
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  statusEl.textContent = "Ficha salva localmente.";
}

function loadSheet() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    updateDerivedStats();
    return;
  }

  try {
    const data = JSON.parse(raw);
    Object.entries(data).forEach(([key, value]) => {
      if (form.elements[key]) {
        form.elements[key].value = value;
        form.elements[key].dispatchEvent(new Event("input", { bubbles: true }));
      }
    });
    statusEl.textContent = "Ficha carregada.";
  } catch {
    statusEl.textContent = "Erro ao carregar dados salvos.";
  }

  updateDerivedStats();
}

function clearSheet() {
  localStorage.removeItem(STORAGE_KEY);
  form.reset();

  document.querySelectorAll(".value-display").forEach((el) => {
    el.textContent = "-";
  });

  // Reaplica o valor base das perícias e recalcula os valores derivados.
  document.querySelectorAll(".skill-row").forEach((row, index) => {
    const input = row.querySelector("input");
    const base = getSkillBaseValue(SKILLS[index]);
    input.value = base;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });

  statusEl.textContent = "Ficha limpa.";
  updateDerivedStats();
}

function flashStatus() {
  clearTimeout(flashStatus.timer);
  flashStatus.timer = setTimeout(() => {
    statusEl.textContent = "";
  }, 2200);
}

buildAttributes();
buildSkills();
initWeaponAutoThresholds();
loadSheet();

form.addEventListener("input", () => {
  statusEl.textContent = "Alterações não salvas.";
  flashStatus();
});

document.getElementById("saveBtn").addEventListener("click", () => {
  saveSheet();
  flashStatus();
});

document.getElementById("clearBtn").addEventListener("click", () => {
  clearSheet();
  flashStatus();
});

document.getElementById("printBtn").addEventListener("click", () => {
  window.print();
});
