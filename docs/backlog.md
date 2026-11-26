# Backlog

Open tasks for Game 2048, set up on 2026-11-26.
This file is the shared work list for parallel chats and agents.

## How to use this file

- Every item has a fixed ID (e.g. `F1`). Refer to it in chats and commit messages.
- Before starting an item, set its status to `in progress` and add a short note who works on it (e.g. "chat merge rules"). Save the file right away so other chats see the claim.
- Check `git status` and `git diff` before you edit shared files. Several chats may touch the same files at the same time.
- When an item is done, set its status to `done` with the date and move on. Keep done items here until the next cleanup so others can see what changed.
- New findings go to the matching section with the next free ID.
- Decisions and their reasoning belong in `decisions.md`, the big picture in `concept.md`.
- Which release an item is planned for is in `roadmap.md`. When you add an item, add it to a release there or to "Later". Ideas that are not mature yet go to `ideas.md` first.

Status values: `open`, `in progress`, `done`, `blocked`.

ID prefixes: `F` game logic and features, `V` visuals and animation, `U` user interface, `T` technical setup, `C` cleanup, `B` bugs, `Q` open questions.

## Technical setup

| ID | Task | Status |
|----|------|--------|
| T1 | Project setup with Vite, TypeScript, Three.js and Vitest, taken over from the Angelkarte (D-021) | done 2026-11-26 |
| T2 | GitHub Actions workflow that tests, builds and deploys to GitHub Pages (D-022) | done 2026-11-26, `.github/workflows/deploy.yml` written, not run on GitHub yet. Still to do by the developer: create the repo `attkins/game-2048`, then enable Pages in the repo settings with the source "GitHub Actions" |
| T3 | Changelog with git-cliff and a release script (D-023) | done 2026-11-26. The first `npm run release` creates `CHANGELOG.md` and the tag `v0.1.0` |
| T4 | Playwright end-to-end smoke test, desktop and mobile viewport | open, the game is playable now (0.2), needs a new dev dependency, ask first |
| T5 | Commit rules with fixed types and scopes, enforced by commitlint and a commit-msg hook (D-025, D-026) | done 2026-11-26 |

## Game logic

| ID | Task | Status |
|----|------|--------|
| F1 | Board logic without any rendering: grid of any size from 3x3 to 6x6, slide in four directions, merge once per move, spawn 2 (90 percent) or 4 (10 percent). Covered by Vitest specs | done 2026-11-26. See `src/game/`, 79 specs |
| F2 | Game over detection (board full and no merge possible) and win detection (2048 chip reached) | done 2026-11-26. See `src/game/`, 79 specs |
| F3 | Score and best score, best score stored in localStorage per board size | done 2026-11-26. See `src/game/`, 79 specs |
| F4 | Input layer: arrow keys, touch swipe and mouse drag become the same four move commands | done 2026-11-26 |

## Visuals

| ID | Task | Status |
|----|------|--------|
| V1 | Toy board: pastel wooden plate with rounded frame and recessed cells, size follows the selected board size (D-014) | done 2026-11-26 |
| V2 | Chip model: thick, chunky, softly rounded, rim band, number on the top face, color per value from the table in `concept.md` (D-016) | done 2026-11-26 |
| V3 | Fixed oblique camera at about 40 degrees elevation (angle still to confirm, Q2), soft key light plus ambient light, toon-like shading. The setup contains a placeholder scene for the camera | done 2026-11-26 |
| V4 | Slide animation with easing, squash and bounce on landing, spawn drops in from above | done 2026-11-26. Slide with ease-out, landing squash, spawn drops in and bounces, reduced motion is respected. See `src/scene/motion.ts` |
| V5 | Merge effect: flash, small spark particles, the new chip hops up (D-017) | in progress. The new chip already hops and grows, flash and sparks are still open |
| V6 | 2048 chip with golden glow and a short celebration | open |

## User interface

| ID | Task | Status |
|----|------|--------|
| U1 | Top bar with score and best score, bottom bar with "New Game" and the board size selector (D-018) | open, waits for Q1 |
| U2 | Win screen and game over screen with restart | open |
| U3 | Responsive layout for portrait and landscape, the board scales to the free space | open |

## Open questions

| ID | Question | Status |
|----|----------|--------|
| Q1 | Confirm proposals P-1 (background color), P-2 (font) and P-3 (UI details) in `decisions.md` | open |
| Q2 | Is the camera tilt of 50 degrees measured from the floor or from the vertical? The placeholder scene measures it from the floor | open |
