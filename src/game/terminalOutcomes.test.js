import { createChessDomain } from './chessDomain';
import { createGameController } from './gameController';
import { GAME_PHASES } from './gameState';

describe('terminal chess outcomes', () => {
  test('reports stalemate as a draw with no winner', () => {
    const domain = createChessDomain('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1');

    expect(domain.getOutcome()).toEqual({
      status: 'stalemate',
      winner: null,
      inCheck: false,
    });
    expect(domain.getLegalMoves()).toHaveLength(0);
  });

  test('reports insufficient material as a draw with no winner', () => {
    const domain = createChessDomain('4k3/8/8/8/8/8/8/4K3 w - - 0 1');

    expect(domain.getOutcome()).toEqual({
      status: 'draw',
      winner: null,
      inCheck: false,
    });
    expect(domain.getLegalMoves().length).toBeGreaterThan(0);
  });

  test('locks the controller after checkmate', () => {
    const domainFactory = () => createChessDomain('7k/5Q2/6K1/8/8/8/8/8 w - - 0 1');
    const controller = createGameController({ createDomain: domainFactory });

    // Qg7# from the supplied position.
    const result = controller.handlePlayerMove({ from: 'f7', to: 'g7' });

    expect(result.accepted).toBe(true);
    expect(result.state.phase).toBe(GAME_PHASES.GAME_OVER);
    expect(result.state.outcome.status).toBe('checkmate');
    expect(controller.handlePlayerMove({ from: 'g6', to: 'f6' })).toMatchObject({
      accepted: false,
      reason: 'WRONG_PHASE',
    });
  });
});
