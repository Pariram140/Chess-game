---
name: chess-game
description: Project-specific guidance for developing, reviewing, testing, and deploying the React + chess.js single-player Chess Game.
---

# Chess Game project skill

Use this skill whenever changing or reviewing this repository.

## Product scope

- Browser-based single-player chess: the user plays White and the CPU plays Black.
- Built with React and `chess.js`; no backend, accounts, multiplayer, matchmaking, or persistent game storage.
- The default CPU strategy chooses a random legal move. It is a functional opponent, not a strong chess engine.
- Product requirements and acceptance criteria are tracked in the [MVP epic](https://github.com/Pariram140/Chess-game/issues/6).

## Architecture

- `src/game/chessDomain.js` wraps `chess.js` and exposes the chess-domain API. Keep the underlying engine encapsulated.
- `src/game/gameState.js` defines lifecycle phases and state transitions.
- `src/game/gameController.js` owns authoritative game state, turn lifecycle, promotion, CPU execution/recovery, reset, and subscriptions.
- `src/game/cpuStrategy.js` defines the CPU strategy contract and validates candidate moves.
- `src/game/randomCpuStrategy.js` implements the default random legal-move strategy.
- `src/components/Board` integrates the game controller with the board UI.
- `src/components/Piece` renders chess pieces.
- Unit and integration tests live beside the game modules; Playwright tests live in `tests/e2e/`.

## Game invariants

1. The user controls White; the CPU controls Black.
2. Only legal moves may change the chess position or move history. Reject invalid requests without mutation.
3. The controller owns lifecycle state. The UI must not bypass the controller to mutate the chess domain.
4. Preserve the explicit promotion flow: a pending pawn promotion requires a choice of queen, rook, bishop, or knight.
5. Represent terminal outcomes, including checkmate, stalemate, and draws, and prevent additional moves after game over.
6. Validate CPU output against the current legal candidates before applying it.
7. Retry a failed/invalid CPU attempt once automatically. After a second failure, preserve Black's turn and position in `CPU_ERROR` and allow manual retry or reset.
8. Reset must invalidate pending asynchronous CPU results so a stale result cannot change the new game.
9. Keep snapshots defensive; callers must not be able to mutate authoritative controller state through returned objects.
10. Keep test-only position-loading hooks restricted to development/test usage; never expose them as production controls.

## Working rules

1. Keep changes focused and aligned with the MVP epic. Do not add backend services, persistence, accounts, or multiplayer without explicit scope approval.
2. Prefer deterministic CPU strategy test doubles in tests; avoid tests that depend on random move selection.
3. Add regression tests for rule/lifecycle changes. Cover both accepted and rejected moves and assert state/history remain unchanged after rejection.
4. For browser-visible behavior, add or update Playwright tests under `tests/e2e/`. Prefer deterministic test positions and stable UI selectors.
5. Keep board/piece rendering consistent with chess.js piece codes (`k`, `q`, `r`, `b`, `n`, `p`) and both colors.
6. Preserve Node.js 20 compatibility and the existing React project conventions.
7. Never claim tests or CI passed without checking the latest GitHub Actions run for the relevant commit/PR.
8. Follow the repository workflow: implement one focused story at a time, open a PR, wait for required CI checks to pass, then merge. After merge, verify the change landed on `main` and confirm its linked issue is closed.
9. If a check fails, inspect the failed job/logs and fix the cause before merging. Do not bypass a failed required check.
10. Do not trigger a manual Render deployment unless the user explicitly authorizes it. The Render auto-deployment investigation (issue #39) is deferred; do not resume it unless asked.
11. Keep README and relevant docs synchronized when product behavior, architecture, tests, or deployment procedures change.

## Verification checklist

- [ ] Run unit/integration tests: `CI=true npm test -- --watchAll=false`
- [ ] Run the production build: `npm run build`
- [ ] Run Playwright browser tests through the existing CI workflow (or `npx playwright test` where the browser dependencies are available)
- [ ] Verify GitHub Actions checks for the latest PR commit
- [ ] After merge, verify `main` contains the change and linked issue is closed
- [ ] For delivery changes, distinguish a successful build from confirmation that the latest commit is live on Render

## Deployment

- Production site: https://pari-chess-game.onrender.com
- Render dashboard: https://dashboard.render.com/static/srv-dba7udmq1p3s73altmog
- Render static-site build command: `npm ci && npm run build`; publish directory: `build`.
- Deployment commit metadata is written to `public/deployment-info.json` at build time and checked by the main-branch CI workflow.
- A successful test/build does not prove the latest commit is deployed. Use deployment metadata/history to verify; never trigger a manual deploy as a diagnostic shortcut.
