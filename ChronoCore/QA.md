# ChronoCore verification

Testing was performed against the running website using the Chrome browser integration, including real pointer drags, wheel input, native button clicks, keyboard input, screenshots, accessibility snapshots, and viewport overrides.

## Completed checks

| Area              | Evidence                                                                                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Procedural model  | Node test checks seven reversible layers, animated gears and balance, finite vertices, finish validation, and fewer than 120 batched meshes.                        |
| Orbit and zoom    | Pointer drag changes the visible angle; wheel zoom and zoom buttons change framing. Keyboard orbit, zoom, and reset exercised.                                      |
| Camera presets    | Perspective, dial, and exhibition caseback visually inspected. Transitions orbit around the object instead of crossing through it.                                  |
| Assembly          | Explode, reassemble, and intermediate keyboard slider values exercised. Mobile explosion scrolls the model into view.                                               |
| Finishes          | Titanium, rose gold, and ceramic selected, with matching appearance and selected states.                                                                            |
| Animation         | Automatic rotation exercised; movement pause and play states verified.                                                                                              |
| Modal             | Calibre details, Escape dismissal, and Discover the layers action exercised.                                                                                        |
| Responsive layout | Screenshots inspected at 1536×735, 1366×768, 768×1024, 390×844, and 320×740. No horizontal document overflow in checked layouts.                                    |
| Performance       | Static batching reduced representative rendering from 791 to 122 draw calls. A settled laptop sample reached 60 fps, with approximately 1 ms CPU render submission. |

## Issues corrected during Chrome iteration

- Controls falling below the laptop fold.
- Overexposed metal lighting and insufficient watch scale.
- Camera presets passing too close to the model.
- Exploded layers clipping at narrow phone widths.
- Frequency units wrapping on the narrowest layout.
- Missing mobile spacing after a hidden line break.
- Small material-selection hit areas.
- Excessive draw calls from repeated screws, indices, and spokes.
- Transparent crystal and dial text incorrectly casting opaque shadows.
- Transparent surfaces intercepting clicks intended for visible mechanisms.

## Scope of evidence

The production bundle was also tested at `http://127.0.0.1:4173/`: compact desktop layout at 1024×768, mobile explosion at 390×844, part identification, craft navigation, interrupted explode/reassemble transitions, and pause/resume. The final production console contained no JavaScript errors. The mobile production check showed the complete exploded watch and no horizontal overflow.

Responsive tests use Chrome viewport emulation, not physical phone hardware. Frame rates varied during loading, resizing, and browser automation; the settled desktop sample is not a cross-device performance guarantee. Reduced-motion handling and the WebGL fallback are implemented but were not separately forced through browser emulation. The model is an artistic mechanical simulation.
