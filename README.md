# Chess Game

A browser-based chess game built with React.

## Current state

The project currently provides a chessboard UI and a basic user/CPU turn indicator. Full legal-move validation and CPU move generation are not implemented yet; treat gameplay as a work in progress.

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

Run the test suite:

```bash
CI=true npm test -- --watchAll=false
```

Create a production build in `build/`:

```bash
npm run build
```

GitHub Actions runs the clean install, unit tests, and production build for pull requests to `main` and pushes to `main`, `chore/**`, and `feature/**` branches.

## Deployment

The production static site is hosted on Render:

- [Play Chess Game](https://pari-chess-game.onrender.com)
- [Render service dashboard](https://dashboard.render.com/static/srv-dba7udmq1p3s73altmog)

Render builds with `npm ci && npm run build` and publishes the `build` directory. Pushes to `main` trigger automatic deployment.

## Contributing

1. Create a focused branch for the change.
2. Run tests and the production build locally when possible.
3. Open a pull request against `main`.
4. Confirm the GitHub Actions checks pass before merging.
