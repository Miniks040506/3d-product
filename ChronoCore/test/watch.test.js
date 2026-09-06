import test from "node:test";
import assert from "node:assert/strict";
import { createWatch, FINISHES } from "../src/watch.js";

test("procedural assembly stays finite, explodes reversibly, and animates its mechanism", () => {
  const model = createWatch();
  assert.equal(model.layers.length, 7);
  assert.equal(model.gears.length, 7);
  const assembled = model.layers.map((g) => g.position.z);
  model.setExplosion(1);
  assert.ok(model.layers.every((g, i) => g.position.z !== assembled[i]));
  model.setExplosion(0);
  assert.deepEqual(
    model.layers.map((g) => g.position.z),
    assembled,
  );
  const initial = model.gears[0].group.rotation.z;
  model.animate(1.23);
  assert.notEqual(model.gears[0].group.rotation.z, initial);
  assert.ok(
    model.gears[0].group.rotation.z * model.gears[1].group.rotation.z < 0,
  );
  assert.notEqual(model.balance.rotation.z, 0);
  for (const finish of Object.keys(FINISHES)) model.setFinish(finish);
  assert.throws(() => model.setFinish("invalid"), RangeError);
  let meshes = 0,
    vertices = 0;
  model.watch.traverse((o) => {
    if (o.isMesh) {
      meshes++;
      const p = o.geometry.attributes.position.array;
      vertices += p.length / 3;
      assert.ok(p.every(Number.isFinite));
    }
  });
  assert.ok(
    vertices > 50000,
    `Expected detailed geometry, got ${vertices} vertices`,
  );
  assert.ok(meshes < 120, `Static batching regressed to ${meshes} meshes`);
  model.dispose();
});
