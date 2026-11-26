# Game 2048 - Concept

Status: Draft v0.7 (2026-11-26)
Companion files: decisions.md (all agreed decisions and pending proposals), backlog.md (tasks), roadmap.md (releases), ideas.md (ideas without a date)

Items marked (ASSUMPTION) or (PROPOSAL) are not confirmed yet. Once confirmed they move to decisions.md.

## 1. Vision

A puzzle game inspired by 2048 and 1024. Instead of flat number tiles, the player slides three-dimensional poker chips on a board that is viewed from an oblique angle. Two chips of the same value merge into one chip of double value. The goal is to reach the 2048 chip. The 3D look is the main differentiator and should make the board feel tactile and interesting. Working title: "Game 2048" (D-010).

## 2. Core mechanics

- Board: selectable from 3x3 to 6x6, default 4x4 (D-006).
- Input: arrow keys, touch swipe and mouse drag (D-012).
- Merge: two adjacent chips of equal value that collide merge into one chip with double the value. A chip merges at most once per move. (ASSUMPTION)
- Spawn: after every valid move a new chip appears on a random empty cell, value 2 (90 percent) or 4 (10 percent). (ASSUMPTION)
- Win: the 2048 chip is the upper limit on all board sizes. Reaching it ends the game with a win screen (D-011, D-013).
- Game over: the board is full and no merge is possible.
- Score: sum of all merged chip values, plus a best score stored locally per board size. (ASSUMPTION)

## 3. Chip design (D-008, D-016)

Each value gets its own color. The chips are thick, chunky and softly rounded like toys, not realistic casino chips. The number sits on the top face. A contrasting edge band or notches around the rim keep the poker chip feeling. Values above 2048 are not needed in the MVP.

| Value | Color |
|-------|-------|
| 2 | white |
| 4 | light blue |
| 8 | green |
| 16 | red |
| 32 | blue |
| 64 | purple |
| 128 | orange |
| 256 | black |
| 512 | silver |
| 1024 | gold |
| 2048 | gold with special glow |

Colors should be saturated and friendly (candy-like) so they stand out on the pastel board. Number color is chosen per chip for good contrast (dark on light chips, white on dark chips).

## 4. Visual concept

- Style: stylized and colorful, cartoon-like with clean shapes and bright colors (D-005).
- Board (D-014): a toy board. A pastel wooden plate with a rounded, slightly thick frame. Each cell is a shallow recessed slot, so chips visibly sit in the board. Grid size follows the selected board size.
- Background (D-019): a single solid color, no scene. (PROPOSAL P-1) Soft warm cream with a very subtle vignette. Alternative: soft sky blue.
- Camera (D-015): fixed, about 50 degrees tilt, perspective projection, board centered. No free rotation in the MVP.
- Lighting: one soft key light with gentle shadows, plus ambient light. Toon-like shading with soft edges.
- Font (D-020): bold, rounded, toy-like and very readable. (PROPOSAL P-2) Fredoka Bold for chip numbers and UI.
- Chip animations: slide with easing, small squash and bounce on landing, spawn drops in from above with a soft landing.
- Merge effect (D-017): when two chips meet they merge, a short flash and a small burst of sparks appear, and the new chip hops up and settles.
- Win: the 2048 chip gets a golden glow and a short celebration, then the win screen.

## 5. User interface (D-018)

- Top: score and best score.
- Center: the 3D board.
- Bottom: action elements, namely a new game button and the board size selection.
- (PROPOSAL P-3) Score and best score as two rounded badges. Bottom bar with "New Game" and a size selector (3x3 to 6x6). Changing the size starts a new game after a confirmation.
- Layout must work in portrait (phone) and landscape (desktop). The board scales to the available space.
- The version number is shown small in a corner (D-023).

## 6. Technology

- Browser game with Three.js and TypeScript (D-004).
- Build tooling: Vite (D-021).
- Unit tests with Vitest (D-021).
- Hosting: GitHub Pages, deployed by a GitHub Actions workflow on every push to main (D-022).
- Game logic separated from rendering, so the rules can be unit tested without a browser.
- Input layer unifies keyboard, swipe and mouse drag into the same four move commands.
- Changelog from Conventional Commits with git-cliff (D-023).
- Commit messages use fixed types and scopes, checked by commitlint in a commit-msg hook (D-025, D-026).
- All code, comments and documentation in English (D-002).

## 7. MVP scope (D-009)

1. Playable board with the rules from section 2, selectable size.
2. 3D chips with colors per value, oblique camera, toy board.
3. Slide, merge (pop with sparks) and spawn animations.
4. Score and best score.
5. Game over and win screen with restart.

Explicitly out of scope for the MVP: undo, sound, themes, leaderboards, daily challenge, endless mode.

## 8. Later feature ideas

Collected in ideas.md.

## 9. Open questions

Only the confirmation of proposals P-1 to P-3. See decisions.md.
