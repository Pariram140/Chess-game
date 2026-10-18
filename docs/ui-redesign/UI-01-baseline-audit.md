# UI-01 — Baseline visual and functional audit

**Status:** Code-level audit recorded before redesign implementation  
**Scope:** Existing React UI, game interactions, accessibility, responsiveness, and regression coverage  
**Related issue:** [#44](https://github.com/Pariram140/Chess-game/issues/44)

## Baseline summary

The current app is a functional, compact chess UI. It renders a heading and subtitle above the board, with game status, reset, promotion choices, CPU retry, and move history provided by the board component. The game controller and chess-domain adapter already own game lifecycle and legal-move behavior; the redesign should preserve that foundation.

This is a source/test audit. No live browser screenshot or viewport-based visual inspection was performed as part of this baseline review.

## Findings

| Area | Current behavior | Redesign implication |
| --- | --- | --- |
| App shell | Minimal centered heading, subtitle, and board | Introduce a branded responsive shell and game layout |
| Board layout | 8×8 button grid; square size uses `clamp(36px, 10vw, 64px)` | Establish explicit desktop/tablet/mobile sizing and board-first mobile layout |
| Board palette | Traditional beige/brown squares and dark border | Apply approved ivory, forest, sage, walnut, and coordinated board tokens |
| Pieces | Unicode chess glyphs rendered by `Piece` | Replace with a consistent Classic Staunton-inspired visual set; verify cross-platform rendering |
| Move feedback | Selected square styling exists | Add legal-destination, capture, last-move, and check feedback without relying on color alone |
| Game status | `role="status"` and `aria-live="polite"` announce status | Preserve announcements and refine status presentation for turn, check, thinking, errors, and terminal states |
| Square controls | Squares are buttons with accessible piece/square labels and pressed state | Preserve semantics; add predictable keyboard navigation and touch-sized targets |
| Actions | Reset and CPU retry are available | Build a clear action area; do not add undo in this release |
| Promotion | Inline group with explicit queen/rook/bishop/knight choices | Convert to an accessible dialog/picker with visible piece choices and managed focus |
| Game over | Outcome appears in the status line; board input is disabled | Add a dedicated game-over dialog while retaining a clear status announcement |
| Move history | Current moves are displayed; empty state is tested | Present a readable, scrollable move list and latest-move emphasis; no historical position review |
| Settings/onboarding | Not currently present | Add first-run onboarding and local UI preferences in later stories |
| Metadata | HTML title and description are still generic CRA defaults | Update as a later polish item if included in the shell story |

## Existing regression coverage

### Unit/component tests

- `src/App.test.js`: app heading and initial position, illegal move rejection, legal pawn move.
- `src/components/Board/Board.test.js`: promotion choices, CPU failure/retry, checkmate and input lock, reset behavior and move-history reset.
- Domain/controller behavior is exercised through the existing game modules and tests.

### Browser tests

`tests/e2e/chess.spec.js` covers:
- 64 squares and initial position
- Illegal move rejection
- Legal player move and CPU reply
- Explicit promotion choice
- Terminal outcome and reset

### CI pipeline

`.github/workflows/ci.yml` runs on pull requests to `main` and includes:
1. `npm ci`
2. React Testing Library tests (`CI=true npm test -- --watchAll=false`)
3. Production build (`npm run build`)
4. Chromium installation and Playwright functional tests

CI must pass on each story PR before merge. The audit itself does not claim a fresh test run; PR checks provide the authoritative run for this change.

## Gaps to address in subsequent stories

1. No legal destination/capture indicators, last-move marker, or dedicated check highlight are currently apparent in the board UI.
2. No explicit responsive layout system exists beyond the square-size clamp.
3. There is no settings or onboarding experience.
4. Promotion is an inline control group rather than a focus-managed dialog.
5. Game-over feedback is status text rather than a dedicated result surface.
6. The current piece rendering relies on platform Unicode glyphs, which may vary by OS/font.
7. Keyboard navigation between squares, reduced-motion behavior, and a complete WCAG 2.2 AA review need explicit verification.

## Design constraints carried forward

- Refined classic visual direction: ivory surfaces, forest-green accents, restrained serif heading accent, readable sans-serif controls.
- White remains at the bottom by default.
- Use a Classic Staunton-inspired piece set.
- Undo and historical position review are outside initial scope.
- Keep the existing React/controller/domain architecture; do not rewrite chess rules for the redesign.
- Do not present CPU difficulty options as functional while the CPU strategy remains random.
- No UI redesign implementation is included in UI-01.