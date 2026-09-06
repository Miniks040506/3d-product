import "./style.css";
import "@fontsource-variable/manrope";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { createWatch, FINISHES } from "./watch.js";

const $ = (id) => document.getElementById(id);
const host = $("canvas-host"),
  reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const state = {
  explode: 0,
  playing: !reducedMotion.matches,
  auto: false,
  time: 0,
};
let renderer,
  scene,
  camera,
  controls,
  model,
  resizeObserver,
  environment,
  pmrem;
let explosion = 0,
  lastTime = 0,
  frame = 0,
  presetAnimation = null,
  disposed = false;
let sampledFrames = 0,
  renderWork = 0,
  sampleStart = performance.now();
const announce = (text) => ($("announcement").textContent = text);
const mobile = () => host.clientWidth < 600;
const distance = () => (mobile() ? 15.2 : 12.9);
const presets = {
  perspective: new THREE.Vector3(4.1, 5, 13),
  front: new THREE.Vector3(0, 0, 14),
  back: new THREE.Vector3(-2, 1, -14),
};

function setCamera(name = "perspective") {
  state.auto = false;
  syncMotion();
  const direction = (
    name === "perspective" && state.explode > 0
      ? new THREE.Vector3(10, 6, 10)
      : presets[name]
  )
    .clone()
    .normalize();
  const from = camera.position.clone().sub(controls.target);
  presetAnimation = {
    direction: from.clone().normalize(),
    rotation: new THREE.Quaternion().setFromUnitVectors(
      from.clone().normalize(),
      direction,
    ),
    fromDistance: from.length(),
    toDistance: distance() + (state.explode / 100) * (mobile() ? 6.2 : 2.1),
    fromTarget: controls.target.clone(),
    target: new THREE.Vector3(0, 0, (state.explode / 100) * 0.25),
    start: performance.now(),
  };
  document.querySelectorAll("[data-view]").forEach((b) => {
    const selected = b.dataset.view === name;
    b.classList.toggle("selected", selected);
    b.setAttribute("aria-pressed", selected);
  });
}
function setExplosion(value, frameView = false) {
  state.explode = THREE.MathUtils.clamp(Number(value) || 0, 0, 100);
  $("separation").value = state.explode;
  $("separation-value").textContent = `${Math.round(state.explode)}%`;
  $("separation").style.setProperty("--progress", `${state.explode}%`);
  $("explode").setAttribute("aria-pressed", state.explode > 0);
  $("explode-text").textContent =
    state.explode > 0 ? "Reassemble" : "Explode view";
  if (frameView) {
    setCamera("perspective");
    if (innerWidth <= 800)
      $("stage").scrollIntoView({
        behavior: reducedMotion.matches ? "instant" : "smooth",
        block: "start",
      });
  }
}
function syncMotion() {
  $("play").setAttribute("aria-pressed", state.playing);
  $("play").setAttribute(
    "aria-label",
    state.playing ? "Pause movement" : "Play movement",
  );
  $("play-icon").textContent = state.playing ? "Ⅱ" : "▷";
  $("play-label").textContent = state.playing ? "Pause" : "Play";
  $("live-label").textContent = state.playing
    ? "MOVEMENT RUNNING"
    : "MOVEMENT PAUSED";
  document
    .querySelector(".stage-top")
    .classList.toggle("paused", !state.playing);
  $("auto-rotate").setAttribute("aria-pressed", state.auto);
  if (controls) controls.autoRotate = state.auto;
}
function zoom(factor) {
  presetAnimation = null;
  camera.position
    .sub(controls.target)
    .multiplyScalar(factor)
    .clampLength(controls.minDistance, controls.maxDistance)
    .add(controls.target);
  controls.update();
}
function explore() {
  setExplosion(100, true);
  if (innerWidth > 800)
    $("experience").scrollIntoView({
      behavior: reducedMotion.matches ? "instant" : "smooth",
    });
  announce("Watch deconstructed. Drag to inspect seven assembly layers.");
}

try {
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setClearColor(0x111311, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;
  host.appendChild(renderer.domElement);
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(36, 1, 0.1, 80);
  camera.position
    .copy(presets.perspective)
    .normalize()
    .multiplyScalar(distance());
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.075;
  controls.enablePan = false;
  controls.minDistance = 7;
  controls.maxDistance = 24;
  controls.autoRotateSpeed = 0.65;
  controls.rotateSpeed = 0.6;
  controls.zoomSpeed = 0.65;
  controls.addEventListener("start", () => {
    presetAnimation = null;
    $("part-label").hidden = true;
    document.querySelectorAll("[data-view]").forEach((b) => {
      b.classList.remove("selected");
      b.setAttribute("aria-pressed", false);
    });
  });
  controls.update();
  pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  environment = pmrem.fromScene(room, 0.04);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.8;
  room.dispose();
  pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xdce5d4, 0x34372c, 0.65));
  const key = new THREE.DirectionalLight(0xffead6, 2.4);
  key.position.set(-3, 5, 8);
  scene.add(key);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -5;
  key.shadow.camera.right = 5;
  key.shadow.camera.top = 5;
  key.shadow.camera.bottom = -5;
  key.shadow.camera.near = 0.1;
  key.shadow.camera.far = 24;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.025;
  const edge = new THREE.DirectionalLight(0xe0ecf7, 1.5);
  edge.position.set(5, -1, 3);
  scene.add(edge);
  const back = new THREE.DirectionalLight(0xbccbb0, 2);
  back.position.set(-3, 2, -5);
  scene.add(back);
  model = createWatch();
  scene.add(model.watch);
  let wasMobile = mobile();
  resizeObserver = new ResizeObserver(() => {
    const width = host.clientWidth,
      height = host.clientHeight;
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    if (wasMobile !== mobile()) {
      wasMobile = mobile();
      setCamera();
    }
  });
  resizeObserver.observe(host);
  syncMotion();
  function tick(now) {
    if (disposed) return;
    frame = requestAnimationFrame(tick);
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    if (document.hidden) return;
    if (state.playing) state.time += dt;
    model.animate(state.time);
    explosion = reducedMotion.matches
      ? state.explode / 100
      : THREE.MathUtils.damp(explosion, state.explode / 100, 5, dt);
    model.setExplosion(explosion);
    if (presetAnimation) {
      const p = presetAnimation;
      let t = reducedMotion.matches ? 1 : Math.min((now - p.start) / 850, 1);
      t = t * t * (3 - 2 * t);
      controls.target.lerpVectors(p.fromTarget, p.target, t);
      camera.position
        .copy(p.direction)
        .applyQuaternion(new THREE.Quaternion().slerp(p.rotation, t))
        .multiplyScalar(THREE.MathUtils.lerp(p.fromDistance, p.toDistance, t))
        .add(controls.target);
      if (t === 1) presetAnimation = null;
    }
    const renderStart = performance.now();
    controls.update(dt);
    renderer.render(scene, camera);
    $("loading").hidden = true;
    if (import.meta.env.DEV) {
      sampledFrames++;
      renderWork += performance.now() - renderStart;
      if (now - sampleStart >= 2000) {
        host.dataset.fps = (
          (sampledFrames * 1000) /
          (now - sampleStart)
        ).toFixed(1);
        host.dataset.drawCalls = renderer.info.render.calls;
        host.dataset.renderMs = (renderWork / sampledFrames).toFixed(2);
        host.dataset.triangles = renderer.info.render.triangles;
        sampledFrames = 0;
        renderWork = 0;
        sampleStart = now;
      }
    }
  }
  frame = requestAnimationFrame(tick);
  const raycaster = new THREE.Raycaster(),
    pointer = new THREE.Vector2();
  raycaster.params.Line.threshold = 0.025;
  let down = null;
  host.addEventListener("pointerdown", (e) => {
    down = { x: e.clientX, y: e.clientY };
  });
  host.addEventListener("pointerup", (e) => {
    if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) return;
    down = null;
    const r = host.getBoundingClientRect();
    pointer.set(
      ((e.clientX - r.left) / r.width) * 2 - 1,
      (-(e.clientY - r.top) / r.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster
      .intersectObject(model.watch, true)
      .find(({ object }) => !object.material?.transparent);
    if (!hit) {
      $("part-label").hidden = true;
      return;
    }
    let obj = hit.object;
    while (obj && !obj.userData.name) obj = obj.parent;
    if (obj) {
      $("part-label").textContent = obj.userData.name;
      $("part-label").hidden = false;
      announce(obj.userData.name);
    }
  });
  host.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    if (
      ![
        "arrowleft",
        "arrowright",
        "arrowup",
        "arrowdown",
        "+",
        "=",
        "-",
        "r",
      ].includes(key)
    )
      return;
    e.preventDefault();
    presetAnimation = null;
    if (key === "r") return setCamera();
    if (key === "+" || key === "=") return zoom(0.88);
    if (key === "-") return zoom(1.12);
    const offset = camera.position.clone().sub(controls.target);
    const s = new THREE.Spherical().setFromVector3(offset);
    if (key === "arrowleft") s.theta -= 0.15;
    if (key === "arrowright") s.theta += 0.15;
    if (key === "arrowup") s.phi -= 0.15;
    if (key === "arrowdown") s.phi += 0.15;
    s.makeSafe();
    camera.position.setFromSpherical(s).add(controls.target);
    controls.update();
  });
  renderer.domElement.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    $("loading").hidden = false;
    $("loading").innerHTML =
      '<p class="error-message">The 3D display was interrupted.<br /><button class="primary" onclick="location.reload()">Reload experience</button></p>';
  });
} catch (error) {
  console.error("ChronoCore could not initialize:", error);
  $("loading").innerHTML =
    '<p class="error-message">This experience needs WebGL 2.<br />Enable hardware acceleration in your browser, then reload.</p>';
  document
    .querySelectorAll(
      ".control-dock button,.control-dock input,.view-controls button,.zoom-controls button,#explore,#craft-explore,#about-explore",
    )
    .forEach((b) => (b.disabled = true));
}

$("explode").addEventListener("click", () => {
  setExplosion(state.explode > 0 ? 0 : 100, true);
  announce(state.explode ? "Watch deconstructed" : "Watch reassembled");
});
$("separation").addEventListener("input", (e) => setExplosion(e.target.value));
document.querySelectorAll("[data-finish]").forEach((button) =>
  button.addEventListener("click", () => {
    const name = button.dataset.finish;
    model.setFinish(name);
    document.querySelectorAll("[data-finish]").forEach((b) => {
      b.classList.toggle("selected", b === button);
      b.setAttribute("aria-pressed", b === button);
    });
    $("finish-label").textContent = FINISHES[name].label;
    announce(`${FINISHES[name].label} finish selected`);
  }),
);
document
  .querySelectorAll("[data-view]")
  .forEach((button) =>
    button.addEventListener("click", () => setCamera(button.dataset.view)),
  );
$("zoom-in").addEventListener("click", () => zoom(0.88));
$("zoom-out").addEventListener("click", () => zoom(1.12));
$("reset").addEventListener("click", () => {
  state.auto = false;
  syncMotion();
  setCamera();
  announce("View reset");
});
$("auto-rotate").addEventListener("click", () => {
  state.auto = !state.auto;
  syncMotion();
});
$("play").addEventListener("click", () => {
  state.playing = !state.playing;
  syncMotion();
});
for (const id of ["explore", "craft-explore"])
  $(id).addEventListener("click", explore);
$("about-open").addEventListener("click", () => $("about").showModal());
$("about-close").addEventListener("click", () => $("about").close());
$("about").addEventListener("click", (e) => {
  if (e.target === $("about")) {
    const r = $("about").getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      $("about").close();
  }
});
$("about-explore").addEventListener("click", () => {
  $("about").close();
  explore();
});
document.querySelectorAll("[data-section]").forEach((button) =>
  button.addEventListener("click", () => {
    $(button.dataset.section).scrollIntoView({
      behavior: reducedMotion.matches ? "instant" : "smooth",
    });
  }),
);
const sectionObserver = new IntersectionObserver(
  ([entry]) => {
    document
      .querySelectorAll("[data-section]")
      .forEach((button) =>
        button.classList.toggle(
          "active",
          button.dataset.section ===
            (entry.isIntersecting ? "craft" : "experience"),
        ),
      );
  },
  { threshold: 0.55 },
);
sectionObserver.observe($("craft"));
reducedMotion.addEventListener("change", () => {
  if (reducedMotion.matches) {
    state.playing = false;
    state.auto = false;
    syncMotion();
  }
});
if (import.meta.hot)
  import.meta.hot.dispose(() => {
    disposed = true;
    cancelAnimationFrame(frame);
    resizeObserver?.disconnect();
    sectionObserver.disconnect();
    controls?.dispose();
    model?.dispose();
    environment?.dispose();
    renderer?.dispose();
    host.replaceChildren();
  });
