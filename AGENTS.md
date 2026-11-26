# AGENTS.md

Guidelines for all AI agents and LLMs working on this project. Read this file before you change anything.

## Project

Game 2048 (working title) is a browser puzzle game in the style of 2048 and 1024. Instead of flat number tiles the player slides three-dimensional poker chips on a toy board that is viewed from an oblique angle. Two chips of the same value merge into one chip of double value. The goal is to reach the 2048 chip.

Planning documents live in `docs/`:

- `concept.md` is the concept.
- `decisions.md` holds all agreed decisions (IDs like `D-014`) and open proposals.
- `backlog.md` is the work list with fixed IDs like `F1` and a status.
- `roadmap.md` says which items ship in which release.
- `ideas.md` collects ideas without a date.

The repository is the working copy. `concept.md` and `decisions.md` are mirrored in the Claude project "Game 2048". If the two differ, tell the developer and do not guess which one is right.

Tech stack: TypeScript in strict mode, Three.js, Vite and Vitest (D-021). The game is deployed to GitHub Pages by `.github/workflows/deploy.yml` (D-022).

## 1. Communication rules

- Address the developer with the informal "Du" (when speaking German). Never use the formal "Sie".
- Reply in the language in which you were asked, usually German.
- Ask clarifying questions when something is ambiguous or when requirements are unclear.
- Mark assumptions clearly, for example "I assume that ...".
- Approach complex tasks step by step and explain your process.
- Analyze the existing code before you suggest or implement changes. Use Read, Grep and Glob for that.
- Items in the concept that are marked as ASSUMPTION or PROPOSAL are not confirmed yet. Do not treat them as decided.

## 2. Code, comments and documentation

- Code, comments and documentation are written in English.
- Use TypeScript in strict mode and avoid `any`.
- Keep the game logic (board, moves, merges, spawn, score, game over) free of any Three.js or DOM code, so the rules can be unit tested without a browser.
- Keep rendering and animation in their own layer. The input layer turns keyboard, swipe and mouse drag into the same four move commands.
- Cover the game logic with Vitest tests, especially merge rules (a chip merges at most once per move), spawn rules and game over detection.
- Follow `.editorconfig` if it exists. Otherwise use UTF-8, LF line endings, two spaces for indentation and a final newline.
- Do not add dependencies without asking. Prefer what Three.js and the browser already offer.
- Never commit secrets. Local values belong in `.env.local`, which stays in `.gitignore`.

## 3. Decisions and documentation workflow

- Every agreed decision is added to `docs/decisions.md` with a new ID, the date and a short reasoning.
- After each decision, update `docs/concept.md` so that it matches. Superseded decisions stay in the log and are marked as superseded.
- Do not quietly change confirmed decisions in code. If a decision seems wrong, raise it with the developer first.
- When you finish work that changes behavior, update the matching docs and the `README.md` in the same change.

## 4. Backlog workflow

- Read `docs/backlog.md` before you start. Refer to items by their ID in chats and in commit messages, for example `feat(logic): merge once per move (F1)`.
- Before you start an item, set its status to `in progress` and add a short note. Save the file right away, because several chats may work in parallel.
- When an item is done, set it to `done` with the date. Add new findings with the next free ID.
- Check `git status` and `git diff` before you edit shared files and never rewrite a file from an old copy.
- Ideas that are not mature go to `docs/ideas.md`. Mature ideas get an ID in the backlog and a place in `docs/roadmap.md`.

## 5. Git guidelines

- NEVER run `git commit` or `git push` on your own. Only prepare the code and leave the commit to the developer.
- Do not stage files, amend, rebase or reset without being asked.
- Commit messages are always in English and follow [Conventional Commits](https://www.conventionalcommits.org), for example `feat(fx): add merge animation` or `fix(input): ignore swipes below the threshold`.
- Types are `feat`, `fix`, `refactor`, `perf`, `style`, `docs`, `test`, `build`, `ci` and `chore`. A scope is required for `feat`, `fix`, `refactor` and `perf` and optional for the others. Use exactly one scope per commit, taken from the table below (D-025).
- commitlint checks every commit message in a `commit-msg` hook (D-026). When you suggest a message, make sure it passes. A new scope needs a decision in `docs/decisions.md` first, then it is added to `commitlint.config.js`.
- When you suggest a commit message, make it fit the change. One commit stays focused on one topic.

| Scope | Use it for |
|-------|------------|
| `logic` | Rules, game state, score and best score in `src/game/` |
| `scene` | Three.js scene, board, chips, camera and light |
| `fx` | Animations and effects such as slide, spawn and merge |
| `input` | Keyboard, swipe and mouse drag |
| `ui` | Bars, screens, layout and the board size selection |
| `deps` | Dependencies and build configuration |
| `ci` | GitHub Actions workflow and deployment |
| `release` | Release script, git-cliff and changelog |

- `npm run release` bumps the version, commits, tags and pushes. Never run it. It is for the developer only.
- `CHANGELOG.md` is generated by git-cliff from the commit messages. Never edit it by hand.

## 6. Natural text style

This applies to all user-facing text, such as UI copy, emails, Markdown files and prompts.

- Avoid typical AI patterns and write naturally and conversationally.
- Never use the ampersand character. Write out "and" (or "und" in German text).
- Never use semicolons.
- Never write bullet points where the first part is bold and followed by a colon.
- UI texts are short, friendly and fit the toy look of the game.
