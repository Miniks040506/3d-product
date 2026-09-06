# 3D Product

This repository contains interactive 3D product experiences. Each project lives in its own folder and is deployed to its own GitHub Pages path.

## Projects

- [ChronoCore](./ChronoCore/) — procedural mechanical watch experience.

Live index: https://miniks040506.github.io/3d-product/

## Add a project

Add a sibling folder containing a `package.json` with `npm test` and `npm run build` scripts. The Pages workflow discovers project folders automatically, builds each one into its own output directory, and publishes it at `/3d-product/<folder>/`.

ChronoCore implementation and Chrome QA notes are in [ChronoCore/README.md](./ChronoCore/README.md) and [ChronoCore/QA.md](./ChronoCore/QA.md).
