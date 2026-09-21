import { test } from "node:test";
import assert from "node:assert/strict";
import { chapterAt, chaptersFor, isMarked, OPEN_PLAY } from "./story";

test("finds the chapter containing a minute, start-inclusive", () => {
  assert.equal(chapterAt("arg-fra-22", 80)?.label, "Late drama");
  assert.equal(chapterAt("arg-fra-22", 80)?.startMin, 80);
  assert.equal(chapterAt("arg-fra-22", 84.9)?.label, "Late drama");
  assert.equal(chapterAt("arg-fra-22", 85)?.label, "Lull");
});

test("pins the marquee moments of the final", () => {
  assert.equal(chapterAt("arg-fra-22", 82)?.label, "Late drama");
  assert.equal(chapterAt("arg-fra-22", 117)?.label, "Late drama");
});

test("returns null for unknown feeds and past-the-end minutes", () => {
  assert.equal(chapterAt("nope", 10), null);
  assert.equal(chapterAt("arg-fra-22", 999), null);
  assert.deepEqual(chaptersFor("nope"), []);
});

test("keeps chapters well-formed", () => {
  for (const id of ["arg-fra-22", "ars-che", "mci-liv", "rma-bar"]) {
    const list = chaptersFor(id);
    assert.ok(list.length > 10, `${id} has chapters`);
    for (const c of list) {
      assert.ok(c.endMin > c.startMin);
      assert.equal(typeof c.label, "string");
    }
  }
  assert.equal(OPEN_PLAY, "Open play");
  assert.equal(isMarked({ startMin: 0, endMin: 5, label: "Siege", confidence: 0.9 }), true);
  assert.equal(isMarked({ startMin: 0, endMin: 5, label: OPEN_PLAY, confidence: 0.4 }), false);
});
