# Chess Game

A browser-based, single-player chess game built with React and [chess.js](https://github.com/jhlywa/chess.js). Play White against a computer opponent playing Black.

## Gameplay

- Legal move validation, including castling, en passant, and promotion.
- Explicit promotion selection: queen, rook, bishop, or knight.
- Checkmate, stalemate, and draw detection.
- Automatic CPU replies using a random legal-move strategy.
- CPU move validation, one automatic retry, a manual retry option after repeated failures, and protection against stale CPU responses after reset.
- Turn/status display, move history, and a reset action.

The CPU currently chooses a random legal move; it is a functional opponent, not a chess engine designed for strong play.

## Architecture

- `src/game/chessDomain.js` wraps the chess.js engine and exposes a narrow domain API.
- `src/game/gameController.js` owns game phases, player/CPU turns, promotion, terminal outcomes, retry handling, and reset behavior.
- `src/game/cpuStrategy.js` defines and validates the CPU strategy contract.
- `src/game/randomCpuStrategy.js` implements the default random legal-move strategy.
- `src/components/Board` renders the board and connects the UI to the controller.

The application is client-side only. It does not use a backend, accounts, multiplayer, or persistent game storage.

## Requirements

- Node.js 20
- npm

## Run locally

```bash
npm ci
npm start
```

Open [http://localhost:3000](http://localhost:3000).

## Tests and production build

Run the unit and integration tests:

```bash
CI=true npm test -- --watchAll=false
```

Create a production build in `build/`:

```bash
npm run build
```

Playwright browser tests are in `tests/e2e/` and are run by the GitHub Actions workflow. The CI pipeline also checks that the deployed site reports the expected commit; deployment verification must pass before the delivery pipeline can be considered fully green.

GitHub Actions runs checks for pull requests to `main` and pushes to `main`, `chore/**`, and `feature/**` branches.

## Deployment

The production static site is hosted on Render:

- [Play Chess Game](https://pari-chess-game.onrender.com)
- [Render service dashboard](https://dashboard.render.com/static/srv-dba7udmq1p3s73altmog)

The Render service is configured to build with `npm ci && npm run build` and publish the `build` directory. The CI deployment-verification job checks whether the live site reports the expected commit. A successful code build alone does not confirm that the latest commit is live.

## Contributing

1. Create a focused branch.
2. Run the relevant tests and production build.
3. Open a pull request against `main`.
4. Confirm required GitHub Actions checks pass before merging.
5. Verify the story issue is closed after its pull request is merged.
