# Gratitude Studio

Gratitude Studio is a personal vision board editor for arranging photos, text,
notes, simple shapes, and drawings. Boards can be saved, reopened, and exported
as images.

## Development

This repository is a Yarn workspace. Install dependencies with `yarn`, then run
`yarn start` for the app or `yarn build` for a production build.

## Editor foundation

The editor uses a fork of Excalidraw for canvas rendering, scene storage,
selection, history, and export. The upstream source is MIT licensed; see
[LICENSE](LICENSE) for the required copyright and license notice. Internal
`@excalidraw/*` package names and existing storage keys remain for scene and
file compatibility.
