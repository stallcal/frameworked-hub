import {
  MAX_REAGENTS,
  MIN_REAGENTS,
  calculateRecipe,
  formatQuantity,
  formatRecipeText
} from "./model.mjs";

const COLORS = ["#084B9E", "#9E382E", "#089E4B", "#1C3049", "#98702E", "#7054A3"];
const byId = (id) => document.getElementById(id);

let nextId = 3;
let reagents = [
  { id: 1, name: "", molarMass: "", equivalents: "1", color: COLORS[0] },
  { id: 2, name: "", molarMass: "", equivalents: "1", color: COLORS[1] }
];
let referenceId = 1;
let latestResult = null;

function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = String(text);
  return element;
}
function colorize(element, color) {
  element.style.setProperty("--reagent-color", color);
  return element;
}
function displayedName(reagent, index) {
  return reagent.name.trim() || "Reagent " + (index + 1);
}

function field(reagent, index, property, labelText, placeholder, numeric) {
  const outer = node("div", "field" + (property === "name" ? " name-field" : ""));
  const label = node("label", "", labelText);
  const input = node("input");
  input.id = "reagent-" + reagent.id + "-" + property;
  input.dataset.reagentId = String(reagent.id);
  input.dataset.field = property;
  input.value = reagent[property];
  input.placeholder = placeholder;
  input.autocomplete = "off";
  input.type = numeric ? "number" : "text";
  if (numeric) {
    input.inputMode = "decimal";
    input.step = "any";
    input.min = "0";
  }
  label.htmlFor = input.id;
  outer.append(label, input);
  return outer;
}

function makeReagentCard(reagent, index) {
  const card = colorize(node("section", "reagent-card"), reagent.color);
  card.dataset.reagentId = String(reagent.id);

  const header = node("div", "reagent-card-head");
  const identity = node("div", "reagent-identity");
  const tag = node("span", "reagent-tag", String(index + 1).padStart(2, "0"));
  tag.setAttribute("aria-hidden", "true");
  identity.append(tag, node("strong", "", "Reagent " + (index + 1)));

  const removeButton = node("button", "remove-reagent", "Remove");
  removeButton.type = "button";
  removeButton.disabled = reagents.length <= MIN_REAGENTS;
  removeButton.setAttribute("aria-label", "Remove Reagent " + (index + 1));
  removeButton.addEventListener("click", () => removeReagent(reagent.id));
  header.append(identity, removeButton);

  const inputs = node("div", "reagent-grid");
  inputs.append(
    field(reagent, index, "name", "Name or formula · optional", "e.g. H₂BDC", false),
    field(reagent, index, "molarMass", "Molar mass · g/mol", "e.g. 166.13", true),
    field(reagent, index, "equivalents", "Molar equivalents", "e.g. 2", true)
  );
  card.append(header, inputs);
  return card;
}

function renderReagentCards() {
  const list = byId("reagentList");
  list.replaceChildren(...reagents.map(makeReagentCard));
  byId("addReagent").disabled = reagents.length >= MAX_REAGENTS;
  byId("addReagent").setAttribute("aria-label", reagents.length >= MAX_REAGENTS ?
    "Maximum six reagents" : "Add another reagent");
  byId("reagentCount").textContent = reagents.length + " REAGENTS";
  updateReferenceOptions();
}

function updateReferenceOptions() {
  const select = byId("referenceReagent");
  select.replaceChildren(...reagents.map((reagent, index) => {
    const option = node("option", "", displayedName(reagent, index));
    option.value = String(reagent.id);
    return option;
  }));
  select.value = String(referenceId);
}

function addReagent() {
  if (reagents.length >= MAX_REAGENTS) return;
  const used = new Set(reagents.map((r) => r.color));
  const color = COLORS.find((candidate) => !used.has(candidate));
  reagents.push({ id: nextId++, name: "", molarMass: "", equivalents: "1", color });
  renderReagentCards();
  renderResults();
  const newest = reagents[reagents.length - 1];
  byId("reagent-" + newest.id + "-name").focus();
}

function removeReagent(id) {
  if (reagents.length <= MIN_REAGENTS) return;
  reagents = reagents.filter((r) => r.id !== id);
  if (!reagents.some((r) => r.id === referenceId)) referenceId = reagents[0].id;
  renderReagentCards();
  renderResults();
}

function makeBarRow(row, maxEquivalents) {
  const barRow = colorize(node("div", "ratio-bar-row"), row.color);
  const marker = node("span", "ratio-bar-tag", String(row.index + 1).padStart(2, "0"));
  marker.setAttribute("aria-label", "Reagent " + (row.index + 1));
  const track = node("div", "ratio-bar-track");
  const fill = node("div", "ratio-bar-fill");
  fill.style.setProperty("--ratio-width", 100 * row.equivalents / maxEquivalents + "%");
  fill.setAttribute("aria-hidden", "true");
  track.append(fill);
  const value = node("span", "ratio-bar-value", formatQuantity(row.equivalents) + " eq");
  barRow.append(marker, track, value);
  return barRow;
}

function makeResultRow(row) {
  const item = colorize(node("div", "result-row"), row.color);
  const stripe = node("span", "result-color");
  stripe.setAttribute("aria-hidden", "true");
  const copy = node("div", "result-description");
  copy.append(
    node("div", "result-name", row.name || "Reagent " + (row.index + 1)),
    node("div", "result-sub", formatQuantity(row.mmol) + " mmol · " +
      formatQuantity(row.equivalents) + " eq" +
      (row.isReference ? " · known basis" : " · calculated"))
  );
  const mass = node("div", "result-mass");
  mass.append(document.createTextNode(formatQuantity(row.massMg) + " "), node("span", "", "mg"));
  item.append(stripe, copy, mass);
  return item;
}

function renderResults() {
  const knownAmount = byId("knownAmount").value;
  const unit = byId("knownUnit").value;
  const result = calculateRecipe(reagents, referenceId, knownAmount, unit);
  latestResult = result.ok ? result : null;

  const status = byId("validationMessage");
  const hasEnteredSomething = reagents.some((r) => r.name.trim() || r.molarMass.trim() || r.equivalents !== "1") ||
    knownAmount.trim() !== "";
  status.className = "validation-message";

  byId("copyResults").disabled = !result.ok;
  byId("results").hidden = !result.ok;
  byId("copyFeedback").textContent = "";

  if (!result.ok) {
    status.textContent = hasEnteredSomething ? result.error :
      "Enter the molar masses, equivalents, and one known quantity to begin.";
    if (hasEnteredSomething) status.classList.add("has-error");
    byId("ratioBars").replaceChildren();
    byId("resultRows").replaceChildren();
    return;
  }
  status.classList.add("is-ready");
  status.textContent = "Molar feed ratio preserved · quantities calculated";
  const enrichedRows = result.rows.map((row) => ({
    ...row, color: reagents[row.index].color
  }));
  const maxEquivalent = Math.max(...enrichedRows.map((r) => r.equivalents));
  byId("ratioBars").replaceChildren(...enrichedRows.map((row) => makeBarRow(row, maxEquivalent)));
  byId("resultRows").replaceChildren(...enrichedRows.map(makeResultRow));
}

function resetAll() {
  nextId = 3;
  reagents = [
    { id: 1, name: "", molarMass: "", equivalents: "1", color: COLORS[0] },
    { id: 2, name: "", molarMass: "", equivalents: "1", color: COLORS[1] }
  ];
  referenceId = 1;
  byId("knownAmount").value = "";
  byId("knownUnit").value = "mg";
  renderReagentCards();
  renderResults();
  byId("reagent-1-name").focus();
}

async function copyResults() {
  if (!latestResult) return;
  const feedback = byId("copyFeedback");
  try {
    if (!navigator.clipboard || !navigator.clipboard.writeText)
      throw new Error("Clipboard API unavailable");
    await navigator.clipboard.writeText(formatRecipeText(latestResult));
    feedback.textContent = "Calculated quantities copied.";
  } catch {
    feedback.textContent = "Copy unavailable in this browser; quantities remain visible above.";
  }
}

byId("reagentList").addEventListener("input", (event) => {
  const input = event.target;
  const id = Number(input.dataset.reagentId);
  const property = input.dataset.field;
  const reagent = reagents.find((r) => r.id === id);
  if (!reagent || !["name", "molarMass", "equivalents"].includes(property)) return;
  reagent[property] = input.value;
  if (property === "name") updateReferenceOptions();
  renderResults();
});
byId("referenceReagent").addEventListener("change", (event) => {
  referenceId = Number(event.target.value);
  renderResults();
});
byId("knownAmount").addEventListener("input", renderResults);
byId("knownUnit").addEventListener("change", renderResults);
byId("addReagent").addEventListener("click", addReagent);
byId("reset").addEventListener("click", resetAll);
byId("copyResults").addEventListener("click", copyResults);

renderReagentCards();
renderResults();
