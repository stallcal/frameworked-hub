import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { bragg, squareLatticeSpacing, compareTwoPlaneInterference, VERSION } from "../static/tools/bragg/model.mjs";

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
  const document = { getElementById: get, documentElement: { attributes:{},setAttribute(k,v){this.attributes[k]=v} } };
  runInNewContext(source, { document, bragg, squareLatticeSpacing, compareTwoPlaneInterference, VERSION });
  return {
    el: get,
    theme: document.documentElement,
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

test("one ray view is primary while the optional lattice model remains calculated", () => {
  const ui = createActivity();
  near(ui.el("d-out").textContent, 4);
  near(ui.el("theta-out").textContent.replace("°", ""), 11.10);
  near(ui.el("angle-out").textContent.replace("°", ""), 22.21);
  assert.equal(ui.el("latticeDetails").hidden, false);
  assert.equal(ui.el("latticeDetails").open, false);
  assert.equal(ui.el("latticePane").hidden, false);
  assert.match(ui.el("latticeGeometry").innerHTML, /Lattice points/);
  assert.match(ui.el("geometry").innerHTML, /2θ/);
});

test("changing lattice parameter updates both the angle and explanation", () => {
  const ui = createActivity();
  ui.change("latticeA", 5);
  near(ui.el("d-out").textContent, 5);
  near(ui.el("angle-out").textContent.replace("°", ""), 17.72);
  assert.match(ui.el("observation").textContent, /decreased from 22\.21° to 17\.72°/);
});

test("changing to diagonal (11) planes changes d and two-theta", () => {
  const ui = createActivity();
  ui.change("planeFamily", "11");
  near(ui.el("d-out").textContent, 4 / Math.sqrt(2),0.01);
  near(ui.el("angle-out").textContent.replace("°", ""), 31.61);
  assert.match(ui.el("latticeGeometry").innerHTML, /Family \(11\)/);
  assert.match(ui.el("observation").textContent, /Switching from \(10\) to \(11\)/);
});

test("impossible wavelengths remove angle readouts and show a meaningful error", () => {
  const ui = createActivity();
  ui.change("wavelength", 20);
  assert.equal(ui.el("angle-out").textContent, "—");
  assert.equal(ui.el("theta-out").textContent, "—");
  assert.equal(ui.el("q-out").textContent, "—");
  assert.match(ui.el("error").textContent, /No physical Bragg angle/);
  assert.equal(ui.el("latticePane").hidden, false);
  assert.match(ui.el("geometry").innerHTML, /No possible Bragg angle/);
});

test("advanced calculator does not pretend to use the guided lattice", () => {
  const ui = createActivity();
  ui.toggleAdvanced(true);
  assert.equal(ui.el("latticePane").hidden, true);
  assert.equal(ui.el("guidedControls").hidden, true);
  assert.match(ui.el("explanation").textContent, /independent of the guided square-lattice schematic/);
  assert.match(ui.el("experimentHelper").textContent, /independent of the square-lattice example/);
  assert.equal(ui.el("latticeDetails").hidden, true);
  ui.change("mode", "angle", "change");
  ui.change("value", 60);
  near(ui.el("d-out").textContent, 1.54, 0.01);
});

test("reset returns from advanced mode to the original guided example", () => {
  const ui = createActivity();
  ui.toggleAdvanced(true);
  ui.change("value", 10);
  ui.reset();
  assert.equal(ui.el("latticePane").hidden, false);
  assert.equal(ui.el("advancedPanel").open, false);
  near(ui.el("d-out").textContent, 4);
  near(ui.el("angle-out").textContent.replace("°", ""), 22.21);
});

test("wave comparison updates live at Bragg and an illustrative off-Bragg angle",()=>{
  const ui=createActivity();
  assert.match(ui.el("constructiveWaves").innerHTML,/Same phase/);
  assert.match(ui.el("destructiveWaves").innerHTML,/Half-cycle offset/);
  assert.match(ui.el("onBraggPath").textContent,/1\.5406 Å = 1λ/);
  assert.match(ui.el("offBraggPath").textContent,/0\.7703 Å = \(1 − ½\)λ/);
  const oldOff=ui.el("offBraggAngle").textContent;
  ui.change("latticeA",5);
  assert.notEqual(ui.el("offBraggAngle").textContent,oldOff);
});
test("invalid Bragg conditions suppress optional phase comparison",()=>{
  const ui=createActivity();
  ui.change("wavelength",20);
  assert.equal(ui.el("interferenceComparison").hidden,true);
  ui.reset();
  assert.equal(ui.el("interferenceComparison").hidden,false);
});
test("advanced mode hides optional guided lattice without hiding wave comparison",()=>{
  const ui=createActivity();
  ui.toggleAdvanced(true);
  assert.equal(ui.el("latticeDetails").hidden,true);
  assert.equal(ui.el("interferenceComparison").hidden,false);
  ui.toggleAdvanced(false);
  assert.equal(ui.el("latticeDetails").hidden,false);
});

test("blue a bracket spans two lattice points and expands with lattice parameter",()=>{
  const ui=createActivity();
  const initial=ui.el("latticeGeometry").innerHTML;
  assert.match(initial,/class="lattice-a-bracket" data-distance-px="34\.4/);
  assert.match(initial,/class="lattice-a-label"/);
  assert.match(initial,/>a<\/text>/);
  assert.match(initial,/>d<\/text>/);
  ui.change("latticeA",5);
  const changed=ui.el("latticeGeometry").innerHTML;
  assert.match(changed,/class="lattice-a-bracket" data-distance-px="43"/);
  assert.match(changed,/class="lattice-previous-dot"/);
  near(ui.el("d-out").textContent,5);
  near(ui.el("angle-out").textContent.replace("°",""),17.72);
  ui.change("planeFamily","11");
  assert.match(ui.el("latticeGeometry").innerHTML,/data-distance-px="43"/);
  near(ui.el("d-out").textContent,5/Math.sqrt(2),0.01);
});
test("optional lattice illustration is available only in guided mode",()=>{
  const ui=createActivity();
  assert.equal(ui.el("latticeDetails").hidden,false);
  ui.toggleAdvanced(true);
  assert.equal(ui.el("latticeDetails").hidden,true);
  ui.toggleAdvanced(false);
  assert.equal(ui.el("latticeDetails").hidden,false);
});
test("measured PXRD example explains why advanced controls matter",()=>{
  const ui=createActivity();
  assert.equal(ui.el("qMetric").hidden,true);
  ui.el("tryMeasuredPeak").handlers.click[0]();
  assert.equal(ui.el("advancedPanel").open,true);
  assert.equal(ui.el("mode").value,"angle");
  assert.equal(ui.el("value").value,"30");
  assert.equal(ui.el("qMetric").hidden,false);
  assert.match(ui.el("advancedQuestion").textContent,/Measured peak/);
  assert.match(ui.el("advancedAnswer").textContent,/experimental 2θ/);
  near(ui.el("d-out").textContent,2.98,0.01);
});

test("diagram-local a slider changes lattice and synchronizes exact numeric input and readout", () => {
  const ui = createActivity();
  assert.equal(ui.el("latticeSliderControl").hidden, false);
  assert.equal(ui.el("advancedSliderControl").hidden, true);
  assert.equal(ui.el("latticeSliderValue").textContent, "4.00 Å");
  ui.change("latticeSlider", "5");
  assert.equal(ui.el("latticeA").value, "5");
  assert.equal(ui.el("latticeSliderValue").textContent, "5.00 Å");
  near(ui.el("d-out").textContent, 5);
  near(ui.el("angle-out").textContent.replace("°", ""), 17.72);
  ui.change("latticeA", "4.5");
  assert.equal(ui.el("latticeSlider").value, "4.5");
  assert.equal(ui.el("latticeSliderValue").textContent, "4.50 Å");
});

test("advanced spacing slider sits alongside ray and hides for angle/q inputs", () => {
  const ui = createActivity();
  ui.toggleAdvanced(true);
  assert.equal(ui.el("latticeSliderControl").hidden, true);
  assert.equal(ui.el("advancedSliderControl").hidden, false);
  assert.equal(ui.el("advancedSliderValue").textContent, "3.00 Å");
  ui.change("spacing-slider", "4");
  assert.equal(ui.el("value").value, "4");
  assert.equal(ui.el("advancedSliderValue").textContent, "4.00 Å");
  near(ui.el("d-out").textContent, 4);
  near(ui.el("angle-out").textContent.replace("°", ""), 22.21);
  ui.change("mode", "angle", "change");
  assert.equal(ui.el("advancedSliderControl").hidden, true);
  ui.change("mode", "q", "change");
  assert.equal(ui.el("advancedSliderControl").hidden, true);
  ui.change("mode", "spacing", "change");
  assert.equal(ui.el("advancedSliderControl").hidden, false);
  ui.reset();
  assert.equal(ui.el("advancedSliderControl").hidden, true);
  assert.equal(ui.el("latticeSliderControl").hidden, false);
});

test("custom wavelength reveals its exact-value input without changing Bragg math", () => {
  const ui = createActivity();
  ui.change("preset", "custom", "change");
  assert.equal(ui.el("wavelengthDetails").open, true);
  ui.change("wavelength", "1");
  near(ui.el("d-out").textContent, 4);
  near(ui.el("angle-out").textContent.replace("°", ""), 14.36, 0.01);
});
test("advanced calculation and optional content remain accessible from the simplified page", () => {
  const html = readFileSync(new URL("../static/tools/bragg/index.html", import.meta.url), "utf8");
  assert.match(html, /<details class="bragg-lattice-details" id="latticeDetails">/);
  assert.match(html, /<details class="bragg-optional" id="interferenceLesson">/);
  assert.match(html, /<details class="advanced-panel" id="advancedPanel">/);
  assert.equal((html.match(/id="geometry"/g) || []).length, 1);
});

test("Bragg page retains its calculation readouts but omits download controls", () => {
  const html = readFileSync(new URL("../static/tools/bragg/index.html", import.meta.url), "utf8");
  assert.match(html, /id="angle-out"/);
  assert.match(html, /id="d-out"/);
  assert.doesNotMatch(html, /id="export"/);
  assert.doesNotMatch(source, /\$\("export"\)/);
});

test("equation accent rule has a deliberate left inset", () => {
  const css = readFileSync(new URL("../static/tools/bragg/style.css", import.meta.url), "utf8");
  assert.match(css, /\.bragg-compact \.bragg-equation\.math-display\s*\{\s*padding:\s*16px 22px 16px 30px/);
});
