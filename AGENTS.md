# AGENTS.md

Guidelines for all AI agents and LLMs working on this project. Read this file before you change anything.

## Project

Game 2048 (working title) is a browser puzzle game in the style of 2048 and 1024. Instead of flat number tiles the player slides three-dimensional poker chips on a toy board that is viewed from an oblique angle. Two chips of the same value merge into one chip of double value. The goal is to reach the 2048 chip.

The concept lives in `docs/concept.md`, all agreed decisions live in `docs/decisions.md` (IDs like `D-014`). The same two files are kept in the Claude project "Game 2048". If the repository and the project docs differ, tell the developer and do not guess which one is right.

Tech stack: TypeScript, Three.js, Vite and Vitest. Vite is still an assumption in the concept, so check `docs/decisions.md` before you rely on it.

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

## 4. Git guidelines

- NEVER run `git commit` or `git push` on your own. Only prepare the code and leave the commit to the developer.
- Do not stage files, amend, rebase or reset without being asked.
- Commit messages are always in English and follow [Conventional Commits](https://www.conventionalcommits.org), for example `feat(board): add merge animation` or `fix(input): ignore swipes below the threshold`.
- When you suggest a commit message, make it fit the change. One commit stays focused on one topic.

## 5. Natural text style

This applies to all user-facing text, such as UI copy, emails, Markdown files and prompts.

- Avoid typical AI patterns and write naturally and conversationally.
- Never use the ampersand character. Write out "and" (or "und" in German text).
- Never use semicolons.
- Never write bullet points where the first part is bold and followed by a colon.
- UI texts are short, friendly and fit the toy look of the game.
