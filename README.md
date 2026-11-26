# Game 2048

A puzzle game in the style of 2048 and 1024, played with chunky 3D poker chips. Slide the chips across a toy board, merge two chips of the same value into one with double the value and try to reach the golden 2048 chip.

The game runs in the browser. The board is viewed from an oblique angle, so the chips feel like real toys that sit in the slots of a pastel wooden plate.

Working title: "Game 2048". It may be renamed later.

## Status

The project is in the concept phase and there is no playable version yet. The first goal is a strict MVP to test the core idea.

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

## Tech stack

- TypeScript and [Three.js](https://threejs.org) for the 3D rendering
- [Vite](https://vite.dev) as build tool (still an assumption, see the decision log)
- [Vitest](https://vitest.dev) for unit tests of the game logic

The game logic is separate from the rendering, so the rules can be tested without a browser.

## Documentation

- [docs/concept.md](docs/concept.md) holds the full concept, including mechanics, visuals, UI and MVP scope.
- [docs/decisions.md](docs/decisions.md) is the decision log with all agreed decisions and open proposals.

## Getting started

Not available yet. Once the project is set up, this section will describe how to install the dependencies and start the development server.

## MVP scope

In scope are the playable board with selectable size, 3D chips, slide, merge and spawn animations, score and best score, and a game over and win screen with restart.

Out of scope for the first version are undo, sound, themes, leaderboards, a daily challenge and an endless mode beyond 2048. These stay on the list of later ideas.

## Contributing

Code, comments and documentation are written in English. Commit messages follow [Conventional Commits](https://www.conventionalcommits.org). Guidelines for AI agents are in [AGENTS.md](AGENTS.md).
