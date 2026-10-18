export const GAME_PHASES = Object.freeze({
  PLAYER_TURN: 'PLAYER_TURN',
  PROMOTION_PENDING: 'PROMOTION_PENDING',
  CPU_THINKING: 'CPU_THINKING',
  CPU_ERROR: 'CPU_ERROR',
  GAME_OVER: 'GAME_OVER',
});

export const GAME_EVENTS = Object.freeze({
  PLAYER_MOVE_ACCEPTED: 'PLAYER_MOVE_ACCEPTED',
  PROMOTION_REQUIRED: 'PROMOTION_REQUIRED',
  PROMOTION_COMPLETED: 'PROMOTION_COMPLETED',
  CPU_MOVE_ACCEPTED: 'CPU_MOVE_ACCEPTED',
  CPU_MOVE_FAILED: 'CPU_MOVE_FAILED',
  CPU_RETRY: 'CPU_RETRY',
  GAME_FINISHED: 'GAME_FINISHED',
  RESET: 'RESET',
});

const INITIAL_FEN =
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export function createInitialGameState() {
  return {
    phase: GAME_PHASES.PLAYER_TURN,
    fen: INITIAL_FEN,
    moveHistory: [],
    selectedSquare: null,
    pendingPromotion: null,
    cpuError: null,
  };
}

const allowedTransitions = {
  [GAME_PHASES.PLAYER_TURN]: {
    [GAME_EVENTS.PLAYER_MOVE_ACCEPTED]: GAME_PHASES.CPU_THINKING,
    [GAME_EVENTS.PROMOTION_REQUIRED]: GAME_PHASES.PROMOTION_PENDING,
    [GAME_EVENTS.GAME_FINISHED]: GAME_PHASES.GAME_OVER,
  },
  [GAME_PHASES.PROMOTION_PENDING]: {
    [GAME_EVENTS.PROMOTION_COMPLETED]: GAME_PHASES.CPU_THINKING,
    [GAME_EVENTS.GAME_FINISHED]: GAME_PHASES.GAME_OVER,
  },
  [GAME_PHASES.CPU_THINKING]: {
    [GAME_EVENTS.CPU_MOVE_ACCEPTED]: GAME_PHASES.PLAYER_TURN,
    [GAME_EVENTS.CPU_MOVE_FAILED]: GAME_PHASES.CPU_ERROR,
    [GAME_EVENTS.GAME_FINISHED]: GAME_PHASES.GAME_OVER,
  },
  [GAME_PHASES.CPU_ERROR]: {
    [GAME_EVENTS.CPU_RETRY]: GAME_PHASES.CPU_THINKING,
    [GAME_EVENTS.RESET]: GAME_PHASES.PLAYER_TURN,
  },
  [GAME_PHASES.GAME_OVER]: {
    [GAME_EVENTS.RESET]: GAME_PHASES.PLAYER_TURN,
  },
};

export function transitionGamePhase(currentPhase, event, { gameOver = false } = {}) {
  if (!Object.values(GAME_PHASES).includes(currentPhase)) {
    throw new RangeError(`Unknown game phase: ${currentPhase}`);
  }

  if (event === GAME_EVENTS.RESET) {
    return GAME_PHASES.PLAYER_TURN;
  }

  const nextPhase = allowedTransitions[currentPhase][event];
  if (!nextPhase) {
    throw new Error(`Invalid game transition: ${currentPhase} + ${event}`);
  }

  // A terminal domain position can override the destination, not transition validation.
  return gameOver ? GAME_PHASES.GAME_OVER : nextPhase;
}
