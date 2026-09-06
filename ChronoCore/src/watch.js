import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

const TAU = Math.PI * 2;
export const FINISHES = {
  titanium: { color: 0xaeb4ac, roughness: 0.27, label: "Titanium" },
  gold: { color: 0xd7a17e, roughness: 0.22, label: "Rose gold" },
  black: { color: 0x343b35, roughness: 0.3, label: "Ceramic" },
};

export function createWatch() {
  const watch = new THREE.Group();
  watch.rotation.z = -0.36;
  const layers = [],
    gears = [];
  const steel = new THREE.MeshStandardMaterial({
    color: FINISHES.titanium.color,
    metalness: 1,
    roughness: 0.27,
  });
  const polished = new THREE.MeshStandardMaterial({
    color: 0xe0e3d8,
    metalness: 1,
    roughness: 0.13,
  });
  const gold = new THREE.MeshStandardMaterial({
    color: 0xc49b51,
    metalness: 0.92,
    roughness: 0.28,
  });
  const goldEdge = new THREE.MeshStandardMaterial({
    color: 0xe6c17a,
    metalness: 1,
    roughness: 0.18,
  });
  const dark = new THREE.MeshStandardMaterial({
    color: 0x292e28,
    metalness: 0.78,
    roughness: 0.38,
  });
  const black = new THREE.MeshStandardMaterial({
    color: 0x101410,
    metalness: 0.25,
    roughness: 0.6,
  });
  const strapMat = new THREE.MeshStandardMaterial({
    color: 0x171a16,
    metalness: 0.04,
    roughness: 0.85,
  });
  const stitchMat = new THREE.MeshStandardMaterial({
    color: 0x514f3c,
    roughness: 0.9,
  });
  const ruby = new THREE.MeshPhysicalMaterial({
    color: 0x991439,
    metalness: 0.32,
    roughness: 0.14,
    clearcoat: 1,
  });
  const lume = new THREE.MeshStandardMaterial({
    color: 0xd7ddc5,
    metalness: 0.15,
    roughness: 0.35,
    emissive: 0x9da580,
    emissiveIntensity: 0.13,
  });
  const crystalMat = new THREE.MeshPhysicalMaterial({
    color: 0xb6d7d1,
    metalness: 0.05,
    roughness: 0.09,
    transparent: true,
    opacity: 0.035,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const shared = new Map();
  function geometry(key, make) {
    if (!shared.has(key)) shared.set(key, make());
    return shared.get(key);
  }
  function add(parent, geo, mat, x = 0, y = 0, z = 0) {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  }
  function box(parent, w, h, d, mat, x = 0, y = 0, z = 0) {
    return add(
      parent,
      geometry(`box${w},${h},${d}`, () => new THREE.BoxGeometry(w, h, d)),
      mat,
      x,
      y,
      z,
    );
  }
  function disc(parent, r, d, mat, x = 0, y = 0, z = 0) {
    const mesh = add(
      parent,
      geometry(`disc${r},${d}`, () => new THREE.CylinderGeometry(r, r, d, 48)),
      mat,
      x,
      y,
      z,
    );
    mesh.rotation.x = Math.PI / 2;
    return mesh;
  }
  function ring(parent, outer, inner, depth, mat, z = 0, x = 0, y = 0) {
    const geo = geometry(`ring${outer},${inner},${depth}`, () => {
      const shape = new THREE.Shape();
      shape.absarc(0, 0, outer, 0, TAU, false);
      const hole = new THREE.Path();
      hole.absarc(0, 0, inner, 0, TAU, true);
      shape.holes.push(hole);
      const g = new THREE.ExtrudeGeometry(shape, {
        depth,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 1,
        bevelSize: 0.015,
        bevelThickness: 0.012,
        curveSegments: 64,
      });
      g.translate(0, 0, -depth / 2);
      return g;
    });
    return add(parent, geo, mat, x, y, z);
  }
  function torus(parent, r, t, mat, z = 0, x = 0, y = 0) {
    return add(
      parent,
      geometry(`torus${r},${t}`, () => new THREE.TorusGeometry(r, t, 8, 96)),
      mat,
      x,
      y,
      z,
    );
  }
  function layer(name, z, travel) {
    const g = new THREE.Group();
    g.position.z = z;
    g.userData = { name, baseZ: z, travel };
    watch.add(g);
    layers.push(g);
    return g;
  }
  function screw(parent, x, y, z, size = 0.065) {
    disc(parent, size, 0.035, polished, x, y, z);
    const slot = box(parent, size * 1.3, 0.017, 0.005, black, x, y, z + 0.022);
    slot.rotation.z = (x + y) * 2;
  }
  function jewel(parent, x, y, z) {
    ring(parent, 0.091, 0.052, 0.025, gold, z, x, y);
    disc(parent, 0.046, 0.03, ruby, x, y, z + 0.008);
    disc(parent, 0.017, 0.035, polished, x, y, z + 0.02);
  }
  const shell = layer("Case & hand-stitched strap", -0.1, -0.9);
  ring(shell, 2.03, 1.82, 0.46, steel);
  torus(shell, 2.02, 0.035, polished, 0.19);
  torus(shell, 2.02, 0.025, polished, -0.21);
  ring(shell, 2.01, 1.87, 0.07, black, 0.17);
  // Tapered articulated strap, with subtle edge stitching and milled lugs.
  for (const side of [-1, 1]) {
    for (const x of [-0.79, 0.79]) {
      const lug = box(shell, 0.26, 0.67, 0.37, steel, x, side * 2.0, -0.11);
      lug.rotation.x = side * -0.19;
      screw(shell, x, side * 2.16, 0.1, 0.06);
    }
    const pin = disc(shell, 0.075, 1.82, polished, 0, side * 2.27, -0.11);
    pin.rotation.set(0, 0, Math.PI / 2);
    for (let i = 0; i < 10; i++) {
      const y = side * (2.36 + i * 0.155),
        z = -0.15 - (i / 10) ** 1.5 * 0.74,
        w = 1.45 - i * 0.022;
      const segment = box(shell, w, 0.171, 0.18, strapMat, 0, y, z);
      segment.rotation.x = -side * (0.11 + i * 0.042);
      for (const sx of [-1, 1]) {
        const stitch = box(
          shell,
          0.022,
          0.078,
          0.012,
          stitchMat,
          sx * (w / 2 - 0.105),
          y,
          z + 0.098,
        );
        stitch.rotation.x = segment.rotation.x;
      }
      if (side === -1 && i > 5 && i % 2 === 0)
        disc(shell, 0.038, 0.008, black, 0, y, z + 0.098);
    }
    box(shell, 1.48, 0.17, 0.26, black, 0, side * 2.58, -0.27);
  }
  const crown = new THREE.Group();
  crown.position.set(2.17, 0, -0.035);
  crown.rotation.y = Math.PI / 2;
  shell.add(crown);
  disc(crown, 0.19, 0.3, steel);
  torus(crown, 0.18, 0.025, polished, 0.14);
  for (let i = 0; i < 36; i++) {
    const a = (i * TAU) / 36;
    const ridge = box(
      crown,
      0.018,
      0.025,
      0.26,
      polished,
      Math.sin(a) * 0.19,
      Math.cos(a) * 0.19,
      0,
    );
    ridge.rotation.z = -a;
  }
  disc(crown, 0.125, 0.012, dark, 0, 0, 0.16);
  const caseback = layer("Exhibition caseback", -0.39, -2.1);
  ring(caseback, 1.97, 1.65, 0.1, steel);
  disc(caseback, 1.65, 0.018, crystalMat, 0, 0, -0.06);
  for (let i = 0; i < 8; i++) {
    const a = (i * TAU) / 8;
    screw(caseback, 1.8 * Math.sin(a), 1.8 * Math.cos(a), -0.07);
  }
  const base = layer("Mainplate & gear train", -0.03, -0.15);
  const plateShape = new THREE.Shape();
  plateShape.absarc(0, 0, 1.79, 0, TAU, false);
  for (const [x, y, r] of [
    [-0.69, 0.64, 0.56],
    [0.61, 0.62, 0.58],
    [-0.72, -0.73, 0.59],
    [0.58, -0.63, 0.62],
  ]) {
    const h = new THREE.Path();
    h.absarc(x, y, r, 0, TAU, true);
    plateShape.holes.push(h);
  }
  const plateGeo = new THREE.ExtrudeGeometry(plateShape, {
    depth: 0.08,
    bevelEnabled: true,
    bevelSize: 0.018,
    bevelThickness: 0.015,
    bevelSegments: 2,
    curveSegments: 48,
  });
  add(base, plateGeo, dark, 0, 0, -0.14);
  ring(base, 1.76, 1.65, 0.045, gold, -0.05);
  // Concentric machining marks remain geometry, rather than external textures.
  for (let i = 0; i < 5; i++)
    torus(base, 1.49 + i * 0.03, 0.003, polished, -0.032);
  function gear(x, y, r, teeth, z, speed, mat = gold) {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    base.add(group);
    const shape = new THREE.Shape();
    for (let i = 0; i < teeth * 4; i++) {
      const a = (i / (teeth * 4)) * TAU;
      const radius = r * (i % 4 === 1 || i % 4 === 2 ? 1 : 0.9);
      const px = Math.cos(a) * radius,
        py = Math.sin(a) * radius;
      i ? shape.lineTo(px, py) : shape.moveTo(px, py);
    }
    shape.closePath();
    const hole = new THREE.Path();
    hole.absarc(0, 0, r * 0.66, 0, TAU, true);
    shape.holes.push(hole);
    add(
      group,
      new THREE.ExtrudeGeometry(shape, {
        depth: 0.06,
        bevelEnabled: true,
        bevelSize: 0.006,
        bevelThickness: 0.007,
        bevelSegments: 1,
        curveSegments: 32,
      }),
      mat,
    );
    torus(group, r * 0.68, 0.013, goldEdge, 0.068);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * TAU;
      const spoke = box(
        group,
        r * 0.12,
        r * 1.34,
        0.05,
        mat,
        Math.sin(a) * r * 0.32,
        Math.cos(a) * r * 0.32,
        0.025,
      );
      spoke.rotation.z = -a;
    }
    disc(group, r * 0.22, 0.095, mat, 0, 0, 0.032);
    ring(group, r * 0.145, r * 0.085, 0.025, polished, 0.095);
    jewel(base, x, y, z + 0.105);
    gears.push({ group, speed });
    return group;
  }
  gear(-0.66, 0.56, 0.68, 42, -0.015, 0.17);
  gear(0.49, 0.83, 0.49, 30, 0.065, (-0.17 * 42) / 30);
  gear(0.84, -0.02, 0.4, 25, -0.025, (0.17 * 42) / 25);
  gear(0.24, -0.67, 0.51, 32, 0.03, (-0.17 * 42) / 32);
  gear(-0.42, -0.13, 0.31, 20, 0.105, (-0.17 * 42) / 20);
  gear(-1.18, -0.11, 0.23, 15, 0.06, (-0.17 * 42) / 15);
  gear(0.97, -0.96, 0.25, 16, 0.03, (0.17 * 42) / 16, polished);
  const bridges = layer("Skeleton bridges & balance", 0.17, 0.7);
  for (const [x, y, angle, length] of [
    [-0.8, 0.67, -0.48, 1.74],
    [0.55, 0.76, 0.9, 1.34],
    [0.32, -0.7, -1.05, 1.53],
  ]) {
    const bridge = box(bridges, 0.16, length, 0.085, steel, x, y, 0.02);
    bridge.rotation.z = angle;
    const trim = box(
      bridges,
      0.024,
      length - 0.08,
      0.015,
      polished,
      x - 0.035,
      y,
      0.071,
    );
    trim.rotation.z = angle;
    for (const s of [-1, 1]) {
      const px = x - Math.sin(angle) * length * 0.42 * s,
        py = y + Math.cos(angle) * length * 0.42 * s;
      disc(bridges, 0.125, 0.085, steel, px, py, 0.02);
      screw(bridges, px, py, 0.08, 0.06);
    }
  }
  const balance = new THREE.Group();
  balance.position.set(-0.81, -0.88, 0.075);
  bridges.add(balance);
  torus(balance, 0.46, 0.034, goldEdge);
  torus(balance, 0.4, 0.018, gold);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * TAU;
    const b = box(balance, 0.045, 0.88, 0.035, gold);
    b.rotation.z = a;
  }
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU;
    disc(
      balance,
      0.031,
      0.04,
      polished,
      Math.sin(a) * 0.455,
      Math.cos(a) * 0.455,
      0.015,
    );
  }
  const spiralPoints = [];
  for (let i = 0; i <= 300; i++) {
    const a = (i / 300) * TAU * 5,
      r = 0.045 + (i / 300) * 0.29;
    spiralPoints.push(
      new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0.038),
    );
  }
  const spring = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(spiralPoints),
    new THREE.LineBasicMaterial({ color: 0x9ba9bc }),
  );
  balance.add(spring);
  jewel(bridges, -0.81, -0.88, 0.13);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    screw(bridges, Math.sin(a) * 1.57, Math.cos(a) * 1.57, 0.01, 0.065);
  }
  const dial = layer("Openworked dial & hour markers", 0.34, 1.5);
  ring(dial, 1.91, 1.56, 0.095, black);
  torus(dial, 1.88, 0.016, polished, 0.056);
  torus(dial, 1.56, 0.013, gold, 0.052);
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * TAU,
      major = i % 5 === 0;
    const marker = box(
      dial,
      major ? 0.054 : 0.016,
      major ? 0.19 : 0.065,
      major ? 0.035 : 0.014,
      major ? lume : polished,
      Math.sin(a) * (major ? 1.715 : 1.79),
      Math.cos(a) * (major ? 1.715 : 1.79),
      0.075,
    );
    marker.rotation.z = -a;
    if (major) {
      const edge = box(
        dial,
        0.083,
        0.23,
        0.024,
        steel,
        Math.sin(a) * 1.715,
        Math.cos(a) * 1.715,
        0.051,
      );
      edge.rotation.z = -a;
    }
  }
  // Dial type is painted onto a locally generated canvas texture.
  const textCanvas =
    typeof document !== "undefined" ? document.createElement("canvas") : null;
  if (textCanvas) {
    textCanvas.width = 1024;
    textCanvas.height = 1024;
    const c = textCanvas.getContext("2d");
    c.clearRect(0, 0, 1024, 1024);
    c.textAlign = "center";
    c.fillStyle = "#dce0ce";
    c.font = "500 23px Arial";
    c.fillText("C H R O N O C O R E", 512, 366);
    c.fillStyle = "#afb19e";
    c.font = "15px Arial";
    c.fillText("M E C H A N I C A L", 512, 394);
    c.font = "12px Arial";
    c.fillText("C A L I B R E   0 1", 512, 724);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * TAU;
      c.font = "17px Arial";
      c.fillStyle = "#91998a";
      c.fillText(
        String(i * 5 || 60).padStart(2, "0"),
        512 + Math.sin(a) * 478,
        518 - Math.cos(a) * 478,
      );
    }
    const texture = new THREE.CanvasTexture(textCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    add(
      dial,
      new THREE.PlaneGeometry(3.68, 3.68),
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
      }),
      0,
      0,
      0.107,
    );
  }
  const hands = layer("Precision hands", 0.49, 2.3);
  function hand(length, width, material, z) {
    const group = new THREE.Group();
    hands.add(group);
    group.position.z = z;
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2, -0.23);
    shape.lineTo(-width / 2, length * 0.63);
    shape.lineTo(0, length);
    shape.lineTo(width / 2, length * 0.63);
    shape.lineTo(width / 2, -0.23);
    shape.closePath();
    add(
      group,
      new THREE.ExtrudeGeometry(shape, {
        depth: 0.025,
        bevelEnabled: true,
        bevelSize: 0.012,
        bevelThickness: 0.008,
        bevelSegments: 1,
      }),
      material,
    );
    if (width > 0.05)
      box(
        group,
        width * 0.35,
        length * 0.55,
        0.009,
        lume,
        0,
        length * 0.43,
        0.04,
      );
    return group;
  }
  const hour = hand(0.96, 0.115, polished, 0),
    minute = hand(1.43, 0.08, polished, 0.05),
    second = hand(1.5, 0.018, goldEdge, 0.1);
  ring(second, 0.095, 0.067, 0.02, goldEdge, 0.018, 0, -0.29);
  disc(hands, 0.105, 0.09, goldEdge, 0, 0, 0.14);
  disc(hands, 0.05, 0.105, black, 0, 0, 0.15);
  const crystal = layer("Sapphire crystal & bezel", 0.58, 3.1);
  ring(crystal, 2.045, 1.895, 0.095, steel);
  torus(crystal, 2.026, 0.018, polished, 0.056);
  torus(crystal, 1.895, 0.014, polished, 0.057);
  disc(crystal, 1.896, 0.023, crystalMat, 0, 0, 0.065);
  for (let i = 0; i < 8; i++) {
    const a = ((i + 0.5) * TAU) / 8;
    screw(crystal, Math.sin(a) * 1.968, Math.cos(a) * 1.968, 0.061, 0.037);
  }
  // Batch stationary parts per material without merging independently moving groups.
  const groups = [];
  const sourceGeometry = new Set();
  watch.traverse((obj) => {
    if (obj.isGroup) groups.push(obj);
  });
  for (const group of groups) {
    const batches = new Map();
    for (const mesh of group.children) {
      if (!mesh.isMesh || mesh.material.transparent) continue;
      if (!batches.has(mesh.material)) batches.set(mesh.material, []);
      batches.get(mesh.material).push(mesh);
    }
    for (const [material, meshes] of batches) {
      if (meshes.length < 2) continue;
      const parts = meshes.map((mesh) => {
        mesh.updateMatrix();
        sourceGeometry.add(mesh.geometry);
        return (
          mesh.geometry.index
            ? mesh.geometry.toNonIndexed()
            : mesh.geometry.clone()
        ).applyMatrix4(mesh.matrix);
      });
      const merged = mergeGeometries(parts);
      group.remove(...meshes);
      group.add(new THREE.Mesh(merged, material));
      parts.forEach((g) => g.dispose());
    }
  }
  const retainedGeometry = new Set();
  watch.traverse((obj) => {
    if (obj.geometry) retainedGeometry.add(obj.geometry);
  });
  sourceGeometry.forEach((g) => {
    if (!retainedGeometry.has(g)) g.dispose();
  });
  shared.clear();
  watch.traverse((obj) => {
    if (obj.isMesh) {
      obj.castShadow = !obj.material.transparent;
      obj.receiveShadow = true;
    }
  });
  function setExplosion(amount) {
    for (const l of layers)
      l.position.z = l.userData.baseZ + l.userData.travel * amount;
  }
  function animate(time) {
    for (const { group, speed } of gears) group.rotation.z = time * speed;
    // ponytail: visual gear ratios and an ideal 4 Hz oscillator; use an escapement solver for engineering analysis.
    balance.rotation.z = Math.sin(time * TAU * 4) * 0.48;
    const seconds = 10 * 3600 + 8 * 60 + time;
    hour.rotation.z = (-seconds / (12 * 3600)) * TAU;
    minute.rotation.z = (-seconds / 3600) * TAU;
    second.rotation.z = (-seconds / 60) * TAU;
  }
  function setFinish(name) {
    const f = FINISHES[name];
    if (!f) throw new RangeError("Unknown case finish");
    steel.color.setHex(f.color);
    steel.roughness = f.roughness;
  }
  function dispose() {
    const geometries = new Set(),
      materials = new Set();
    watch.traverse((o) => {
      if (o.geometry) geometries.add(o.geometry);
      if (o.material) materials.add(o.material);
    });
    for (const g of geometries) g.dispose();
    for (const m of materials) {
      m.map?.dispose();
      m.dispose();
    }
  }
  animate(0);
  return {
    watch,
    layers,
    gears,
    balance,
    hands: { hour, minute, second },
    setExplosion,
    animate,
    setFinish,
    dispose,
  };
}
