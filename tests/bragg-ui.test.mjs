import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { bragg, squareLatticeSpacing, VERSION } from "../static/tools/bragg/model.mjs";

const file = new URL("../static/tools/bragg/app.mjs", import.meta.url);
const source = readFileSync(file, "utf8").replace(/^import [^\n]+\n/, "");

function createActivity() {
  const values = {
    mode: "spacing", value: "3", wavelength: "1.5406", order: "1",
    preset: "1.5406", latticeA: "4", latticeSlider: "4",
    planeFamily: "10", "spacing-slider": "3"
  };
  const nodes = new Map();
  function get(id) {
    if (!nodes.has(id)) {
      let val = values[id] ?? "";
      const item = {
        id, get value() { return val; }, set value(x) { val = String(x); },
        hidden: false, disabled: false, open: false,
        textContent: "", innerHTML: "",
        handlers: {},
        classList: { toggle() {} },
        addEventListener(type, fn) {
          (this.handlers[type] ||= []).push(fn);
        },
        setAttribute() {}
      };
      nodes.set(id, item);
    }
    return nodes.get(id);
  }
  const document = { getElementById: get };
  runInNewContext(source, { document, bragg, squareLatticeSpacing, VERSION });
  return {
    el: get,
    change(id, value, event = "input") {
      get(id).value = value;
      const handlers = get(id).handlers[event] || [];
      for (const fn of handlers) fn();
    },
    toggleAdvanced(open) {
      get("advancedPanel").open = open;
      for (const fn of get("advancedPanel").handlers.toggle || []) fn();
    },
    reset() {
      for (const fn of get("reset").handlers.click || []) fn();
    }
  };
}
const near = (a, b, tolerance = 1e-4) =>
  assert.ok(Math.abs(Number(a) - b) <= tolerance, "Expected " + a + " ≈ " + b);

test("lattice and ray views are simultaneously shown with correct initial angles", () => {
  const ui = createActivity();
  near(ui.el("d-out").textContent, 4);
  near(ui.el("theta-out").textContent.replace("°", ""), 11.1031);
  near(ui.el("angle-out").textContent.replace("°", ""), 22.20619);
  assert.equal(ui.el("latticePane").hidden, false);
  assert.match(ui.el("latticeGeometry").innerHTML, /Lattice points/);
  assert.match(ui.el("geometry").innerHTML, /2θ/);
});

test("changing lattice parameter updates both the angle and explanation", () => {
  const ui = createActivity();
  ui.change("latticeA", 5);
  near(ui.el("d-out").textContent, 5);
  near(ui.el("angle-out").textContent.replace("°", ""), 17.72457);
  assert.match(ui.el("observation").textContent, /decreased from 22\.20619° to 17\.72457°/);
});

test("changing to diagonal (11) planes changes d and two-theta", () => {
  const ui = createActivity();
  ui.change("planeFamily", "11");
  near(ui.el("d-out").textContent, 4 / Math.sqrt(2));
  near(ui.el("angle-out").textContent.replace("°", ""), 31.60738);
  assert.match(ui.el("latticeGeometry").innerHTML, /Family \(11\)/);
  assert.match(ui.el("observation").textContent, /Switching from \(10\) to \(11\)/);
});

test("impossible wavelengths remove angle readouts and disable export", () => {
  const ui = createActivity();
  ui.change("wavelength", 20);
  assert.equal(ui.el("angle-out").textContent, "—");
  assert.equal(ui.el("theta-out").textContent, "—");
  assert.equal(ui.el("q-out").textContent, "—");
  assert.equal(ui.el("export").disabled, true);
  assert.match(ui.el("error").textContent, /No physical Bragg angle/);
  assert.equal(ui.el("latticePane").hidden, false);
  assert.match(ui.el("geometry").innerHTML, /No possible Bragg angle/);
});

test("advanced calculator does not pretend to use the guided lattice", () => {
  const ui = createActivity();
  ui.toggleAdvanced(true);
  assert.equal(ui.el("latticePane").hidden, true);
  assert.equal(ui.el("guidedControls").hidden, true);
  assert.match(ui.el("explanation").textContent, /not attached to the schematic/);
  ui.change("mode", "angle", "change");
  ui.change("value", 60);
  near(ui.el("d-out").textContent, 1.5406, 1e-4);
});

test("reset returns from advanced mode to the original guided example", () => {
  const ui = createActivity();
  ui.toggleAdvanced(true);
  ui.change("value", 10);
  ui.reset();
  assert.equal(ui.el("latticePane").hidden, false);
  assert.equal(ui.el("advancedPanel").open, false);
  near(ui.el("d-out").textContent, 4);
  near(ui.el("angle-out").textContent.replace("°", ""), 22.20619);
});
