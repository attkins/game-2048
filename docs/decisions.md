# Decision Log - Game 2048

Rule: Every agreed decision is added here with date and short reasoning. The concept lives in concept.md and is updated after each decision.

## Decisions

| ID | Date | Decision | Reasoning |
|----|------|----------|-----------|
| D-001 | 2026-11-26 | Concept and decisions are kept in Markdown files. They live in `docs/` of the repository and are mirrored in the Project docs of the Claude project "Game 2048". | Always available across sessions. The repo is the working copy, the project docs are the mirror. |
| D-002 | 2026-11-26 | Documentation, code and comments are written in English. Conversation with the developer is in German (Du). | Standing project preference. |
| D-003 | 2026-11-26 | Core idea: 2048-style merge puzzle with 3D poker chips on an oblique-view board. | Original project description. |
| D-004 | 2026-11-26 | Platform: browser game, built with Three.js (TypeScript). | Runs everywhere, real 3D, easy to share. |
| D-005 | 2026-11-26 | Visual style: stylized and colorful (cartoon-like), not photorealistic. | Developer choice. Also easier to render well and performant. |
| D-006 | 2026-11-26 | Board size is selectable (3x3 up to 6x6), 4x4 as default. | Developer choice. Gives replay value. |
| D-007 | 2026-11-26 | SUPERSEDED by D-013. Originally: win screen at 2048, then endless mode. | |
| D-008 | 2026-11-26 | The draft chip color scale in concept.md stays as is for now. | Developer approved. |
| D-009 | 2026-11-26 | First version is a strict MVP to test the concept. No undo, sound or themes. | Validate the core idea first. |
| D-010 | 2026-11-26 | Working title is "Game 2048". May be renamed later. | Not important yet. |
| D-011 | 2026-11-26 | The win target is 2048 on all board sizes in the MVP. Per-size targets can be revisited after testing. | Keep it simple, test how it feels. |
| D-012 | 2026-11-26 | Input: keyboard (arrow keys), touch swipe and mouse drag. | Developer choice. |
| D-013 | 2026-11-26 | 2048 is the upper limit in the MVP. Reaching it ends the game with a win screen. Continuing beyond 2048 (endless mode, colors for 4096 and higher) is a possible later feature. | Developer choice. Replaces D-007. |
| D-014 | 2026-11-26 | Board theme: toy board. Pastel wooden plate with recessed cells, like a children's game. | Developer choice. |
| D-015 | 2026-11-26 | Camera: fixed oblique view at about 50 degrees tilt, perspective projection. | Good balance of 3D effect and readability. |
| D-016 | 2026-11-26 | Chip look: thick, chunky, softly rounded toy chips with the number on the top face. | Developer choice. Fits the toy board. |
| D-017 | 2026-11-26 | Merge effect: pop with sparks. Chips merge, short flash with small particles, the new chip hops up. | Developer choice. |
| D-018 | 2026-11-26 | UI layout: score and best score at the top, action elements (restart, board size selection) at the bottom. | Developer choice. |
| D-019 | 2026-11-26 | Background should be a single solid color, no scene. The concrete color is proposed by Claude (see proposals). | Developer preference, color left to Claude. |
| D-020 | 2026-11-26 | Font: a bold, easily readable, toy-like rounded font. The concrete font is proposed by Claude (see proposals). | Developer preference, font left to Claude. |
| D-021 | 2026-11-26 | Project setup follows the Angelkarte project: Vite, TypeScript in strict mode, Three.js and Vitest. Playwright end-to-end tests are left out for now and come back once something playable exists. | Proven setup of the developer. E2E tests need a playable game to be useful. |
| D-022 | 2026-11-26 | Hosting on GitHub Pages in the repo `attkins/game-2048`. One workflow (`deploy.yml`) runs type-check, tests and build on every push to main and then deploys. No separate workflow for pull requests. | The game is playable by link. The deploy workflow already guards main. |
| D-023 | 2026-11-26 | The changelog is generated from Conventional Commits with git-cliff (`cliff.toml`). `scripts/release.mjs` bumps the version, commits, tags and pushes. It is run by the developer only. The version is shown small in the game. | Same flow as the Angelkarte. AI agents never commit or push (see AGENTS.md). |
| D-024 | 2026-11-26 | Planning lives in `docs/`: backlog.md (tasks with fixed IDs and status), roadmap.md (releases, says when) and ideas.md (ideas without a date). Mature ideas move into the backlog. | Same structure as the Angelkarte, keeps what, when and why apart. |

## Proposals awaiting confirmation

- P-1 Background color: soft warm cream (about #FFF1D6) with a very subtle vignette towards the edges. Reason: pastel wood and colorful chips stand out well, and the look stays calm and toy-like. Alternative: soft sky blue (about #CFE8F3). The setup already uses the cream color as a placeholder.
- P-2 Font: Fredoka Bold (free, open license, rounded and chunky). Used for chip numbers and UI. Alternative: Baloo 2 Bold.
- P-3 UI details: top bar shows "Score" and "Best" as two rounded badges. Bottom bar has a "New Game" button and a board size selector (3x3, 4x4, 5x5, 6x6). Changing the size starts a new game after a confirmation.

## Open questions

None besides confirming the proposals above.

## Change history

- 2026-11-26: File created, concept draft v0.1 written.
- 2026-11-26: D-004 to D-007 added after first round of questions.
- 2026-11-26: D-008 to D-010 added, open questions reduced.
- 2026-11-26: D-011 to D-013 added, D-007 superseded, open questions cleared.
- 2026-11-26: D-014 to D-017 added (visual decisions), new open questions on background, font and UI.
- 2026-11-26: D-018 to D-020 added, proposals P-1 to P-3 added.
- 2026-11-26: D-001 updated, D-021 to D-024 added (project setup from the Angelkarte).
