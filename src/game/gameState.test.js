import {
  createInitialGameState,
  GAME_EVENTS,
  GAME_PHASES,
  transitionGamePhase,
} from './gameState';

describe('game state model', () => {
  test('creates the initial state for the player turn', () => {
    expect(createInitialGameState()).toEqual({
      phase: GAME_PHASES.PLAYER_TURN,
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      moveHistory: [],
      selectedSquare: null,
      pendingPromotion: null,
      cpuError: null,
    });
  });

  test('models promotion as a separate phase before the CPU turn', () => {
    expect(
      transitionGamePhase(GAME_PHASES.PLAYER_TURN, GAME_EVENTS.PROMOTION_REQUIRED),
    ).toBe(GAME_PHASES.PROMOTION_PENDING);

    expect(
      transitionGamePhase(GAME_PHASES.PROMOTION_PENDING, GAME_EVENTS.PROMOTION_COMPLETED),
    ).toBe(GAME_PHASES.CPU_THINKING);
  });

  test('moves through a CPU turn and returns control to the player', () => {
    const cpuThinking = transitionGamePhase(
      GAME_PHASES.PLAYER_TURN,
      GAME_EVENTS.PLAYER_MOVE_ACCEPTED,
    );

    expect(cpuThinking).toBe(GAME_PHASES.CPU_THINKING);
    expect(
      transitionGamePhase(cpuThinking, GAME_EVENTS.CPU_MOVE_ACCEPTED),
    ).toBe(GAME_PHASES.PLAYER_TURN);
  });

  test('represents CPU failure and explicit retry', () => {
    const cpuError = transitionGamePhase(
      GAME_PHASES.CPU_THINKING,
      GAME_EVENTS.CPU_MOVE_FAILED,
    );

    expect(cpuError).toBe(GAME_PHASES.CPU_ERROR);
    expect(
      transitionGamePhase(cpuError, GAME_EVENTS.CPU_RETRY),
    ).toBe(GAME_PHASES.CPU_THINKING);
  });

  test('makes game-over terminal until reset', () => {
    expect(
      transitionGamePhase(GAME_PHASES.CPU_THINKING, GAME_EVENTS.GAME_FINISHED),
    ).toBe(GAME_PHASES.GAME_OVER);

    expect(() =>
      transitionGamePhase(GAME_PHASES.GAME_OVER, GAME_EVENTS.PLAYER_MOVE_ACCEPTED),
    ).toThrow(/Invalid game transition/);

    expect(
      transitionGamePhase(GAME_PHASES.GAME_OVER, GAME_EVENTS.RESET),
    ).toBe(GAME_PHASES.PLAYER_TURN);
  });

  test('does not allow unrelated transitions from the current phase', () => {
    expect(() =>
      transitionGamePhase(GAME_PHASES.PLAYER_TURN, GAME_EVENTS.CPU_MOVE_ACCEPTED),
    ).toThrow(/Invalid game transition/);
  });

  test('forces the game-over phase when the domain reports a terminal position', () => {
    expect(
      transitionGamePhase(
        GAME_PHASES.CPU_THINKING,
        GAME_EVENTS.CPU_MOVE_ACCEPTED,
        { gameOver: true },
      ),
    ).toBe(GAME_PHASES.GAME_OVER);
  });

  test('does not let a terminal-position override bypass transition validation', () => {
    expect(() =>
      transitionGamePhase(
        GAME_PHASES.PLAYER_TURN,
        GAME_EVENTS.CPU_MOVE_ACCEPTED,
        { gameOver: true },
      ),
    ).toThrow(/Invalid game transition/);

    expect(() =>
      transitionGamePhase(
        GAME_PHASES.GAME_OVER,
        GAME_EVENTS.PLAYER_MOVE_ACCEPTED,
        { gameOver: true },
      ),
    ).toThrow(/Invalid game transition/);
  });
});
