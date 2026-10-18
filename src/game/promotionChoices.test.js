import { createChessDomain } from './chessDomain';
import { createGameController } from './gameController';
import { GAME_PHASES } from './gameState';

const PROMOTION_FEN = '4k3/P7/8/8/8/8/8/4K3 w - - 0 1';

describe.each([
  ['q', 'q', GAME_PHASES.CPU_THINKING, 'ongoing'],
  ['r', 'r', GAME_PHASES.CPU_THINKING, 'ongoing'],
  ['b', 'b', GAME_PHASES.GAME_OVER, 'draw'],
  ['n', 'n', GAME_PHASES.GAME_OVER, 'draw'],
])('promotion to %s', (choice, expectedPiece, expectedPhase, expectedOutcome) => {
  test('applies the chosen piece and derives the resulting game state', () => {
    const controller = createGameController({
      createDomain: () => createChessDomain(PROMOTION_FEN),
    });

    const pending = controller.handlePlayerMove({ from: 'a7', to: 'a8' });
    expect(pending.reason).toBe('PROMOTION_REQUIRED');
    expect(pending.state.phase).toBe(GAME_PHASES.PROMOTION_PENDING);
    expect(pending.state.pendingPromotion.choices).toEqual(['q', 'r', 'b', 'n']);

    const result = controller.choosePromotion(choice);
    expect(result.accepted).toBe(true);
    expect(result.state.board[0][0]).toEqual(
      expect.objectContaining({ type: expectedPiece, color: 'w' }),
    );
    expect(result.state.phase).toBe(expectedPhase);
    expect(result.state.outcome.status).toBe(expectedOutcome);
    expect(result.state.pendingPromotion).toBeNull();
    expect(result.state.moveHistory).toHaveLength(1);
  });
});

test('rejects promotion selection when no promotion is pending', () => {
  const controller = createGameController();
  const before = controller.getState();

  expect(controller.choosePromotion('q')).toMatchObject({
    accepted: false,
    reason: 'WRONG_PHASE',
  });
  expect(controller.getState()).toEqual(before);
});
