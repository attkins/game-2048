# Roadmap

Planned releases of Game 2048, set up on 2026-11-26.

This file says when something ships. What an item is and its current status stay in [backlog.md](backlog.md), referenced by ID. Decisions and their reasoning stay in [decisions.md](decisions.md).

Dates are left open on purpose, this is a hobby project. A release ships when its goal is met. Items can move between releases, update this file when they do.

## Overview

| Release | Theme | Status |
|---------|-------|--------|
| 0.1 | Rules | done |
| 0.2 | Chips on the board | done, T4 still open |
| 0.3 | Alive | in progress |
| 0.4 | Complete game | planned |
| 1.0 | MVP | planned |
| later | Ideas without a date, see [ideas.md](ideas.md) | |

Nothing released yet, see [CHANGELOG.md](../CHANGELOG.md) once the first release is out.

## 0.1 Rules

Goal: the rules of the game work and are tested, without any visuals.

- F1 Board logic with slide, merge and spawn
- F2 Game over and win detection
- F3 Score and best score

Done when the Vitest specs cover merge once per move, spawn and game over for all board sizes.

## 0.2 Chips on the board

Goal: the game is playable with the first real 3D look.

- V1 Toy board
- V2 Chip model with colors
- V3 Camera and lighting
- F4 Input with keyboard, swipe and mouse drag
- T4 Playwright smoke test

Done when you can play a full game on desktop and phone, even if the chips still jump from cell to cell.

## 0.3 Alive

Goal: the game feels tactile.

- V4 Slide and spawn animation
- V5 Merge effect
- V6 2048 chip with glow

Done when moves, merges and the win moment feel good in a short playtest.

## 0.4 Complete game

Goal: everything around the board is there.

- U1 Top and bottom bar, board size selector
- U2 Win and game over screens
- U3 Responsive layout

Done when a friend can open the link and play without explanation.

## 1.0 MVP

Goal: the MVP scope from `concept.md` is finished and tested on real devices.

- Playtest on at least one phone and one desktop browser
- Open points from the playtest
- Decision on the final title (D-010)

## Later

See [ideas.md](ideas.md). Ideas move into a release here once they are mature and have an ID in the backlog.
