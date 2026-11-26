# Game 2048

A puzzle game in the style of 2048 and 1024, played with chunky 3D poker chips. Slide the chips across a toy board, merge two chips of the same value into one with double the value and try to reach the golden 2048 chip.

The game runs in the browser. The board is viewed from an oblique angle, so the chips feel like real toys that sit in the slots of a pastel wooden plate.

Working title: "Game 2048". It may be renamed later.

## Status

The project is in the concept phase. The setup is done and a placeholder scene (a board with one chip) is deployed, but the game is not playable yet. See [docs/roadmap.md](docs/roadmap.md) for what comes next.

## How it plays

- The board is 4x4 by default and can be set from 3x3 up to 6x6.
- Move the chips with the arrow keys, a touch swipe or a mouse drag.
- Two chips of the same value that collide merge into one chip of double value. A chip merges at most once per move.
- After every valid move a new chip appears on a random empty cell, usually with the value 2 and sometimes 4.
- Reaching the 2048 chip ends the game with a win screen. The game is over when the board is full and no merge is possible.
- The score is the sum of all merged values. The best score is stored locally for each board size.

## Look and feel

- Stylized and colorful, cartoon-like, with a pastel wooden toy board and recessed cells.
- Thick, softly rounded chips with a rim band and the number on the top face. Every value has its own color, from white (2) over red (16) and black (256) up to gold (1024) and glowing gold (2048).
- A fixed oblique camera at about 50 degrees with perspective projection.
- Chips slide with easing and squash a little when they land. Merges come with a short flash, a few sparks and a small hop.
- A single solid background color and a bold, rounded, toy-like font.

## Getting started

Requires Node 22.13+ or 24+.

```sh
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

Other scripts:

```sh
npm run build       # type-check and build into dist/
npm run preview     # serve the build locally
npm run type-check  # TypeScript only
npm test            # run the unit tests once
npm run test:watch  # run the unit tests on every change
```

## Tech stack

- TypeScript in strict mode and [Three.js](https://threejs.org) for the 3D rendering
- [Vite](https://vite.dev) as build tool
- [Vitest](https://vitest.dev) for unit tests of the game logic

The game logic is separate from the rendering, so the rules can be tested without a browser.

## Project structure

```
index.html                  Vite entry point
src/main.ts                 bootstrap, currently a placeholder scene
src/style.css               global styles
src/env.d.ts                type for the version injected by Vite
src/**/*.spec.ts            unit tests, next to the file they test
scripts/release.mjs         release script, see below
docs/                       concept, decisions, backlog, roadmap and ideas
.github/workflows/          deploy workflow
cliff.toml                  git-cliff configuration for the changelog
```

## Deployment

Every push to `main` runs `.github/workflows/deploy.yml`. It installs the dependencies, runs the type-check and the tests, builds the game and deploys it to GitHub Pages. The Vite `base` is relative, so the build works under `/<repo>/` as well as on any other path.

One-time setup in the GitHub repository: open Settings, then Pages, and choose "GitHub Actions" as the source.

## Changelog and releases

`CHANGELOG.md` is generated from the commit messages with [git-cliff](https://git-cliff.org), configured in `cliff.toml`. It only works if commits follow [Conventional Commits](https://www.conventionalcommits.org): `feat:` for new features, `fix:` for fixes, plus `docs:`, `test:`, `refactor:`, `build:`, `ci:` and `chore:`. Commits that do not follow the convention are left out.

```sh
npm run changelog       # update CHANGELOG.md, new commits go under "Unreleased"
npm run release         # patch release, also release:minor and release:major
```

`npm run release` refuses to run on a dirty working tree. It bumps the version in `package.json`, regenerates the changelog, commits both, creates the tag and pushes. The version is shown small in the corner of the game. Because the script commits and pushes, only the developer runs it.

git-cliff takes the versions from the git tags (`v0.1.0` and so on), not from `package.json`. Without any tag the first bump starts at `v0.1.0`.

## Documentation

- [docs/concept.md](docs/concept.md) holds the full concept, including mechanics, visuals, UI and MVP scope.
- [docs/decisions.md](docs/decisions.md) is the decision log with all agreed decisions and open proposals.
- [docs/backlog.md](docs/backlog.md) is the work list with fixed IDs and status.
- [docs/roadmap.md](docs/roadmap.md) says which items ship in which release.
- [docs/ideas.md](docs/ideas.md) collects ideas without a date.

## MVP scope

In scope are the playable board with selectable size, 3D chips, slide, merge and spawn animations, score and best score, and a game over and win screen with restart.

Out of scope for the first version are undo, sound, themes, leaderboards, a daily challenge and an endless mode beyond 2048. These stay on the list of ideas.

## Contributing

Code, comments and documentation are written in English. Commit messages follow [Conventional Commits](https://www.conventionalcommits.org). Guidelines for AI agents are in [AGENTS.md](AGENTS.md).
