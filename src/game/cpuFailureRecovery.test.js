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

describe('CPU failure recovery', () => {
  test('retries once automatically and completes when the second attempt succeeds', async () => {
    let calls = 0;
    const controller = createGameController({
      cpuStrategy: async () => {
        calls += 1;
        if (calls === 1) throw new Error('temporary failure');
        return { from: 'e7', to: 'e5' };
      },
    });
    const completed = waitForState(
      controller,
      (state) => state.phase === GAME_PHASES.PLAYER_TURN && state.moveHistory.length === 2,
    );

    controller.handlePlayerMove({ from: 'e2', to: 'e4' });
    const state = await completed;

    expect(calls).toBe(2);
    expect(state.moveHistory).toEqual(['e4', 'e5']);
    expect(state.cpuError).toBeNull();
  });

  test('enters CPU_ERROR after two failures and supports manual retry', async () => {
    let calls = 0;
    const controller = createGameController({
      cpuStrategy: async () => {
        calls += 1;
        if (calls <= 2) throw new Error('CPU offline');
        return { from: 'e7', to: 'e5' };
      },
    });
    const failed = waitForState(controller, (state) => state.phase === GAME_PHASES.CPU_ERROR);

    controller.handlePlayerMove({ from: 'e2', to: 'e4' });
    const errorState = await failed;
    expect(calls).toBe(2);
    expect(errorState.cpuError).toBe('CPU offline');
    expect(errorState.turn).toBe('b');
    expect(errorState.moveHistory).toEqual(['e4']);

    const completed = waitForState(
      controller,
      (state) => state.phase === GAME_PHASES.PLAYER_TURN && state.moveHistory.length === 2,
    );
    expect(controller.retryCpuMove().accepted).toBe(true);
    const finalState = await completed;
    expect(calls).toBe(3);
    expect(finalState.moveHistory).toEqual(['e4', 'e5']);
  });

  test('does not allow retry outside CPU_ERROR', () => {
    const controller = createGameController({ cpuStrategy: null });
    expect(controller.retryCpuMove()).toMatchObject({
      accepted: false,
      reason: 'WRONG_PHASE',
    });
  });

  test('reset invalidates pending CPU results', async () => {
    let resolveStrategy;
    const controller = createGameController({
      cpuStrategy: () => new Promise((resolve) => { resolveStrategy = resolve; }),
    });
    controller.handlePlayerMove({ from: 'e2', to: 'e4' });
    controller.reset();
    resolveStrategy({ from: 'e7', to: 'e5' });

    await Promise.resolve();
    await Promise.resolve();
    expect(controller.getState().phase).toBe(GAME_PHASES.PLAYER_TURN);
    expect(controller.getState().moveHistory).toEqual([]);
  });
});
