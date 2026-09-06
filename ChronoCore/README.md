# 3D Product / ChronoCore

A luxury mechanical-watch exhibit built with Three.js, native HTML/CSS, and Vite. ChronoCore is the first project in the 3D Product collection; future product experiences can be added alongside it. All watch geometry, dial graphics, and studio reflections are generated locally. No external 3D models, textures, HDR files, or runtime CDN requests.

Live page: https://miniks040506.github.io/3d-product/ChronoCore/

## Run

Requires Node.js 22.12+ (developed with Node 24).

```sh
npm install
npm run dev
```

On Windows PowerShell with script execution disabled, use `npm.cmd` instead of `npm`.

```sh
npm test
npm run build
npm run preview
```

Vite prints the local URL. The production output is `dist/`, suitable for any static host.

## Explore

- Drag the watch to orbit; scroll or pinch to zoom. Zoom buttons and camera presets are also available.
- Select **Explode view**, **Explore the movement**, or adjust the deconstruction slider to separate seven assembly layers. Reassemble at any point, including during a transition.
- Choose titanium, rose gold, or ceramic. Pause/resume the mechanism independently of automatic camera rotation.
- Click a visible part to identify its assembly layer.
- Focus the watch with Tab: arrow keys rotate, `+` / `-` zoom, and `R` resets the camera. The native slider supports keyboard adjustment.
- Open **Inside the calibre** for details. Escape closes the native modal and restores focus.

The model includes a case and crown, stitched strap, exhibition back, openworked mainplate, seven toothed wheels, bridgework, jeweled pivots, a 4 Hz balance with spiral hairspring, hour markers, three hands, and a crystal. This is an artistic mechanism with consistent illustrative gear ratios, not a physically solved escapement or manufacturing design. Displayed specifications belong to the concept watch.

## Implementation

`src/watch.js` owns procedural geometry and animation. Static parts are batched by material within each independently moving group. `src/main.js` owns the scene, controls, smooth camera orbits, and UI state. `src/style.css` owns the responsive layout.

The renderer uses a generated studio environment, physically based metal materials, dynamic shadows, capped pixel density, damped orbit controls, and frame-rate-independent animation. Reduced-motion preferences start the movement paused and make transitions immediate. WebGL initialization failures show a useful fallback. The interface remains readable before the renderer starts.

The self-hosted Manrope font is distributed through Fontsource under the SIL Open Font License. Three.js and Vite retain their upstream licenses. Orbit behavior follows the [Three.js OrbitControls API](https://threejs.org/docs/pages/OrbitControls.html).

## Validation

See [QA.md](QA.md) for Chrome interaction and viewport checks. `npm test` checks reversible assembly, finite generated geometry, opposing gear rotation, the balance oscillator, finish validation, and the static mesh batching budget. No external test framework is required.

Vite reports an advisory for the approximately 600 kB minified JavaScript bundle (about 154 kB gzip), primarily the Three.js renderer. The production build succeeds; all 3D functionality is used on the first screen.
