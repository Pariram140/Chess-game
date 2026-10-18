import { createGameController } from './gameController';
import { GAME_PHASES } from './gameState';

function waitForState(controller, predicate) {
  return new Promise((resolve) => {
    const unsubscribe = controller.subscribe((state) => {
      if (predicate(state)) {
        unsubscribe();
        resolve(state);
      }
    });
  });
}

describe('automatic CPU turns', () => {
  test('runs the CPU after a player move and returns control to White', async () => {
    const controller = createGameController({
      cpuStrategy: async ({ legalMoves }) => {
        expect(legalMoves.length).toBeGreaterThan(0);
        return { from: 'e7', to: 'e5' };
      },
    });
    const completed = waitForState(
      controller,
      (state) => state.phase === GAME_PHASES.PLAYER_TURN && state.moveHistory.length === 2,
    );

    const playerMove = controller.handlePlayerMove({ from: 'e2', to: 'e4' });
    expect(playerMove.accepted).toBe(true);
    expect(playerMove.state.phase).toBe(GAME_PHASES.CPU_THINKING);

    const state = await completed;
    expect(state.turn).toBe('w');
    expect(state.moveHistory).toEqual(['e4', 'e5']);
    expect(state.phase).toBe(GAME_PHASES.PLAYER_TURN);
  });

  test('rejects a CPU move that is not in the legal candidate list', async () => {
    const controller = createGameController({
      cpuStrategy: async () => ({ from: 'e7', to: 'e4' }),
    });
    const failed = waitForState(controller, (state) => state.phase === GAME_PHASES.CPU_ERROR);

    controller.handlePlayerMove({ from: 'e2', to: 'e4' });
    const state = await failed;

    expect(state.moveHistory).toEqual(['e4']);
    expect(state.turn).toBe('b');
    expect(state.cpuError).toMatch(/outside the legal candidates/);
  });

  test('ignores a CPU result that resolves after reset', async () => {
    let resolveStrategy;
    const controller = createGameController({
      cpuStrategy: () => new Promise((resolve) => {
        resolveStrategy = resolve;
      }),
    });

    controller.handlePlayerMove({ from: 'e2', to: 'e4' });
    expect(controller.getState().phase).toBe(GAME_PHASES.CPU_THINKING);
    controller.reset();
    resolveStrategy({ from: 'e7', to: 'e5' });

    await Promise.resolve();
    await Promise.resolve();
    expect(controller.getState().phase).toBe(GAME_PHASES.PLAYER_TURN);
    expect(controller.getState().moveHistory).toEqual([]);
    expect(controller.getState().turn).toBe('w');
  });
});
