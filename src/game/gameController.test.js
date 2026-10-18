import { createChessDomain } from './chessDomain';
import { createGameController } from './gameController';
import { GAME_PHASES } from './gameState';

const PROMOTION_FEN = '4k3/P7/8/8/8/8/8/4K3 w - - 0 1';
const MATE_IN_ONE_FEN = '7k/5Q2/6K1/8/8/8/8/8 w - - 0 1';

describe('game controller', () => {
  test('initializes the standard position in the player phase', () => {
    const controller = createGameController({ cpuStrategy: null });
    const state = controller.getState();

    expect(state.phase).toBe(GAME_PHASES.PLAYER_TURN);
    expect(state.turn).toBe('w');
    expect(state.moveHistory).toEqual([]);
    expect(state.outcome.status).toBe('ongoing');
    expect(state.pendingPromotion).toBeNull();
  });

  test('accepts a legal player move and updates the authoritative snapshot', () => {
    const controller = createGameController({ cpuStrategy: null });

    const result = controller.handlePlayerMove({ from: 'e2', to: 'e4' });

    expect(result.accepted).toBe(true);
    expect(result.state.phase).toBe(GAME_PHASES.CPU_THINKING);
    expect(result.state.turn).toBe('b');
    expect(result.state.moveHistory).toEqual(['e4']);
    expect(result.state.fen).toBe(controller.getState().fen);
  });

  test('rejects illegal moves without changing state or history', () => {
    const controller = createGameController({ cpuStrategy: null });
    const before = controller.getState();

    expect(controller.handlePlayerMove({ from: 'e2', to: 'e5' }).reason).toBe('ILLEGAL_MOVE');
    expect(controller.getState()).toEqual(before);
  });

  test('locks player input outside the player phase', () => {
    const controller = createGameController({ cpuStrategy: null });
    controller.handlePlayerMove({ from: 'e2', to: 'e4' });
    const before = controller.getState();

    expect(controller.handlePlayerMove({ from: 'd2', to: 'd4' }).reason).toBe('WRONG_PHASE');
    expect(controller.getState()).toEqual(before);
  });

  test('requires promotion selection before changing the board', () => {
    const controller = createGameController({
      cpuStrategy: null,
      createDomain: () => createChessDomain(PROMOTION_FEN),
    });
    const before = controller.getState();

    const pending = controller.handlePlayerMove({ from: 'a7', to: 'a8' });
    expect(pending.reason).toBe('PROMOTION_REQUIRED');
    expect(pending.state.phase).toBe(GAME_PHASES.PROMOTION_PENDING);
    expect(pending.state.fen).toBe(before.fen);
    expect(pending.state.moveHistory).toEqual([]);
    expect(pending.state.pendingPromotion.choices).toEqual(['q', 'r', 'b', 'n']);

    const invalid = controller.choosePromotion('k');
    expect(invalid.reason).toBe('INVALID_PROMOTION');
    expect(controller.getState().phase).toBe(GAME_PHASES.PROMOTION_PENDING);

    const promoted = controller.choosePromotion('q');
    expect(promoted.accepted).toBe(true);
    expect(promoted.state.phase).toBe(GAME_PHASES.CPU_THINKING);
    expect(promoted.state.board[0][0]).toEqual(expect.objectContaining({ type: 'q', color: 'w' }));
    expect(promoted.state.pendingPromotion).toBeNull();
  });

  test('moves to GAME_OVER when the accepted player move checkmates', () => {
    const controller = createGameController({
      cpuStrategy: null,
      createDomain: () => createChessDomain(MATE_IN_ONE_FEN),
    });

    const result = controller.handlePlayerMove({ from: 'f7', to: 'g7' });

    expect(result.accepted).toBe(true);
    expect(result.state.phase).toBe(GAME_PHASES.GAME_OVER);
    expect(result.state.outcome).toEqual({
      status: 'checkmate',
      winner: 'w',
      inCheck: true,
    });
  });

  test('reset restores the standard position and notifies subscribers', () => {
    const controller = createGameController({ cpuStrategy: null });
    const listener = jest.fn();
    const unsubscribe = controller.subscribe(listener);

    controller.handlePlayerMove({ from: 'e2', to: 'e4' });
    listener.mockClear();

    const state = controller.reset();
    expect(state.phase).toBe(GAME_PHASES.PLAYER_TURN);
    expect(state.turn).toBe('w');
    expect(state.moveHistory).toEqual([]);
    expect(state.fen).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0]).toEqual(state);

    unsubscribe();
    controller.handlePlayerMove({ from: 'e2', to: 'e4' });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  test('returns defensive state snapshots', () => {
    const controller = createGameController({ cpuStrategy: null });
    const state = controller.getState();
    state.board[0][0].type = 'q';
    state.moveHistory.push('tampered');

    expect(controller.getState().board[0][0].type).toBe('r');
    expect(controller.getState().moveHistory).toEqual([]);
  });
});
