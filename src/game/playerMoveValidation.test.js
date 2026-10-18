import { createGameController } from './gameController';

describe('player move validation', () => {
  test('rejects malformed move requests without changing the game', () => {
    const controller = createGameController();
    const before = controller.getState();

    expect(controller.handlePlayerMove().reason).toBe('INVALID_MOVE');
    expect(controller.handlePlayerMove({ from: 'e2' }).reason).toBe('INVALID_MOVE');
    expect(controller.handlePlayerMove({ to: 'e4' }).reason).toBe('INVALID_MOVE');
    expect(controller.getState()).toEqual(before);
  });

  test('does not apply the same player move twice while the CPU owns the turn', () => {
    const controller = createGameController();

    const first = controller.handlePlayerMove({ from: 'e2', to: 'e4' });
    expect(first.accepted).toBe(true);
    const afterFirstMove = controller.getState();

    const duplicate = controller.handlePlayerMove({ from: 'e2', to: 'e4' });
    expect(duplicate).toMatchObject({ accepted: false, reason: 'WRONG_PHASE' });
    expect(controller.getState()).toEqual(afterFirstMove);
    expect(controller.getState().moveHistory).toEqual(['e4']);
  });
});
