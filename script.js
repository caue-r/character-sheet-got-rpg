const STORAGE_KEY = "ficha_cthulhu_v1";

const ATTRIBUTES = [
  "FOR", "CON", "DES", "APA", "POD", "INT", "TAM", "EDU"
];

const BASE_SKILLS = [
  { name: "Arte/Oficio", base: 5 },
  { name: "Biblioteca", base: 20 },
  { name: "Charme", base: 15 },
  { name: "Escutar", base: 20 },
  { name: "Esquiva", auto: "DES/2" },
  { name: "Furtividade", base: 20 },
  { name: "Intimidação", base: 15 },
  { name: "Lábia", base: 5 },
  { name: "Medicina", base: 1 },
  { name: "Ocultismo", base: 5 },
  { name: "Persuasão", base: 10 },
  { name: "Primeiros Socorros", base: 30 },
  { name: "Psicologia", base: 10 },
  { name: "Rastrear", base: 10 }
];

const REQUESTED_SKILLS = [
  { name: "Arremessar", base: 20 },
  { name: "Arte/Oficio", base: 5 },
  { name: "Avaliação", base: 5 },
  { name: "Cavalgar", base: 15 },
  { name: "Charme", base: 15 },
  { name: "Engenhosidade", base: 5 },
  { name: "Disfarce", base: 5 },
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
  { name: "Presdigitação", base: 10 },
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
const importBtn = document.getElementById("importBtn");
const importFileInput = document.getElementById("importFileInput");
const WEAPON_ROWS = 4;
const CUSTOM_SKILLS_COUNT = 5;
const EXPORT_APP_ID = "ficha-rpg";
const EXPORT_VERSION = 1;

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

  for (let i = 1; i <= CUSTOM_SKILLS_COUNT; i += 1) {
    const row = document.createElement("div");
    row.className = "skill-row custom-skill-row";

    const customName = document.createElement("input");
    customName.type = "text";
    customName.name = `custom_skill_${i}_name`;
    customName.placeholder = "Perícia personalizada";

    const customValue = document.createElement("input");
    customValue.type = "number";
    customValue.name = `custom_skill_${i}_value`;
    customValue.min = "0";
    customValue.max = "99";

    const half = makeReadonlyValue();
    const fifth = makeReadonlyValue();

    customValue.addEventListener("input", () => {
      if (customValue.value === "") {
        half.textContent = "-";
        fifth.textContent = "-";
        return;
      }
      applySkillDerived(customValue, half, fifth);
    });

    row.append(customName, customValue, half, fifth);
    skillsList.appendChild(row);
  }
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

function calcDamageBonus(str, tam) {
  if (!str || !tam) {
    return "";
  }

  const total = str + tam;

  if (total <= 64) {
    return "-2";
  }

  if (total <= 84) {
    return "-1";
  }

  if (total <= 124) {
    return "0";
  }

  if (total <= 164) {
    return "+1d4";
  }

  if (total <= 204) {
    return "+1d6";
  }

  const extraDice = Math.floor((total - 205) / 80);
  return `+${2 + extraDice}d6`;
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
  const damageBonus = calcDamageBonus(str, tam);

  form.elements.pv.value = hp || "";
  form.elements.pm.value = mp || "";
  form.elements.mov.value = mov;
  form.elements.mov.readOnly = true;
  form.elements.dbuild.value = damageBonus;
  form.elements.dbuild.readOnly = true;

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

function collectFormData() {
  const data = {};
  const elements = Array.from(form.elements);

  elements.forEach((el) => {
    if (!el.name) {
      return;
    }
    data[el.name] = el.value;
  });

  return data;
}

function buildExportFilename(characterName) {
  const normalizedName = (characterName || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_-]/g, "");

  const safeName = normalizedName || "personagem_sem_nome";
  return `${safeName}.json`;
}

function buildExportPayload(data) {
  return {
    meta: {
      app: EXPORT_APP_ID,
      version: EXPORT_VERSION,
      exportedAt: new Date().toISOString()
    },
    data
  };
}

function downloadSheetJson(data) {
  const payload = buildExportPayload(data);
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json"
  });
  const fileName = buildExportFilename(data.nome);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function saveSheetJsonWithPicker(data) {
  if (typeof window.showSaveFilePicker !== "function") {
    downloadSheetJson(data);
    return "download";
  }

  const payload = buildExportPayload(data);
  const content = JSON.stringify(payload, null, 2);
  const fileName = buildExportFilename(data.nome);
  const handle = await window.showSaveFilePicker({
    suggestedName: fileName,
    types: [
      {
        description: "Arquivo JSON",
        accept: {
          "application/json": [".json"]
        }
      }
    ]
  });

  const writable = await handle.createWritable();
  await writable.write(content);
  await writable.close();
  return "picker";
}

function applySheetData(data) {
  Object.entries(data).forEach(([key, value]) => {
    if (!form.elements[key]) {
      return;
    }
    form.elements[key].value = value;
    form.elements[key].dispatchEvent(new Event("input", { bubbles: true }));
  });

  updateDerivedStats();
}

async function saveSheet() {
  const data = collectFormData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

  try {
    const method = await saveSheetJsonWithPicker(data);
    statusEl.textContent =
      method === "picker"
        ? "Registro exportado em JSON no local escolhido."
        : "Registro exportado em JSON e salvo localmente.";
  } catch (error) {
    if (error && error.name === "AbortError") {
      statusEl.textContent = "Salvamento cancelado pelo usuário.";
      return;
    }
    statusEl.textContent = "Erro ao exportar JSON.";
  }
}

function parseImportedData(content) {
  let parsed;

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Arquivo JSON inválido.");
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Estrutura de arquivo inválida.");
  }

  const { data } = parsed;
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Arquivo sem bloco 'data' válido.");
  }

  const applicableEntries = Object.entries(data).filter(([key]) =>
    Boolean(form.elements[key])
  );

  if (!applicableEntries.length) {
    throw new Error("Nenhum campo válido encontrado para importação.");
  }

  return Object.fromEntries(applicableEntries);
}

async function importSheetFromFile(file) {
  if (!file) {
    return;
  }

  const raw = await file.text();
  const data = parseImportedData(raw);

  applySheetData(data);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  statusEl.textContent = "Ficha importada com sucesso.";
}

function loadSheet() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    updateDerivedStats();
    return;
  }

  try {
    const data = JSON.parse(raw);
    applySheetData(data);
    statusEl.textContent = "Ficha carregada.";
  } catch {
    statusEl.textContent = "Erro ao carregar dados salvos.";
  }
}

function clearSheet() {
  localStorage.removeItem(STORAGE_KEY);
  form.reset();

  document.querySelectorAll(".value-display").forEach((el) => {
    el.textContent = "-";
  });

  resetSkillsToDefault();

  statusEl.textContent = "Ficha limpa.";
  updateDerivedStats();
}

function resetSkillsToDefault() {
  SKILLS.forEach((skill) => {
    const input = form.elements[`skill_${skill.name}`];
    if (!input) {
      return;
    }
    const base = getSkillBaseValue(skill);
    input.value = base;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });

  for (let i = 1; i <= CUSTOM_SKILLS_COUNT; i += 1) {
    const nameInput = form.elements[`custom_skill_${i}_name`];
    const valueInput = form.elements[`custom_skill_${i}_value`];

    if (nameInput) {
      nameInput.value = "";
    }

    if (valueInput) {
      valueInput.value = "";
      const row = valueInput.closest(".skill-row");
      if (!row) {
        continue;
      }
      row.querySelectorAll(".value-display").forEach((el) => {
        el.textContent = "-";
      });
    }
  }
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

document.getElementById("saveBtn").addEventListener("click", async () => {
  await saveSheet();
  flashStatus();
});

importBtn.addEventListener("click", () => {
  importFileInput.click();
});

importFileInput.addEventListener("change", async () => {
  const [file] = importFileInput.files || [];

  try {
    await importSheetFromFile(file);
  } catch (error) {
    statusEl.textContent = error.message || "Erro ao importar arquivo.";
  } finally {
    importFileInput.value = "";
    flashStatus();
  }
});

document.getElementById("clearBtn").addEventListener("click", () => {
  clearSheet();
  flashStatus();
});
