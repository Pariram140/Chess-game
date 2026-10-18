import {
  createInitialGameState,
  GAME_EVENTS,
  GAME_PHASES,
  transitionGamePhase,
} from './gameState';
import { createChessDomain } from './chessDomain';

function cloneSnapshot(snapshot) {
  return {
    fen: snapshot.fen,
    turn: snapshot.turn,
    moveHistory: [...snapshot.moveHistory],
    board: snapshot.board.map((row) =>
      row.map((piece) => (piece ? { ...piece } : null)),
    ),
    outcome: { ...snapshot.outcome },
  };
}

/**
 * Coordinates the lifecycle and keeps the chess domain private to the
 * controller. CPU execution is intentionally left to the CPU-strategy story.
 */
export function createGameController({ createDomain = createChessDomain } = {}) {
  let domain = createDomain(createInitialGameState().fen);
  let state = createInitialGameState();
  const listeners = new Set();

  function getState() {
    return {
      ...state,
      ...cloneSnapshot(domain.getSnapshot()),
      pendingPromotion: state.pendingPromotion
        ? {
            ...state.pendingPromotion,
            choices: [...state.pendingPromotion.choices],
          }
        : null,
    };
  }

  function publish() {
    const nextState = getState();
    listeners.forEach((listener) => listener(nextState));
  }

  function setPhase(event, gameOver = false) {
    state = {
      ...state,
      phase: transitionGamePhase(state.phase, event, { gameOver }),
    };
  }

  function applyAcceptedMove(result, event) {
    const terminal = result.snapshot.outcome.status !== 'ongoing';
    state = {
      ...state,
      fen: result.snapshot.fen,
      moveHistory: [...result.snapshot.moveHistory],
      selectedSquare: null,
      pendingPromotion: null,
      cpuError: null,
    };
    setPhase(terminal ? GAME_EVENTS.GAME_FINISHED : event, terminal);
    publish();
    return { ...result, state: getState() };
  }

  function handlePlayerMove(move) {
    if (state.phase !== GAME_PHASES.PLAYER_TURN) {
      return { accepted: false, reason: 'WRONG_PHASE', state: getState() };
    }

    const result = domain.makeMove(move);
    if (!result.accepted && result.reason === 'PROMOTION_REQUIRED') {
      setPhase(GAME_EVENTS.PROMOTION_REQUIRED);
      state = {
        ...state,
        pendingPromotion: {
          from: move.from,
          to: move.to,
          choices: [...result.choices],
        },
        selectedSquare: null,
      };
      publish();
      return { ...result, state: getState() };
    }

    if (!result.accepted) {
      return { ...result, state: getState() };
    }

    return applyAcceptedMove(result, GAME_EVENTS.PLAYER_MOVE_ACCEPTED);
  }

  function choosePromotion(piece) {
    if (state.phase !== GAME_PHASES.PROMOTION_PENDING || !state.pendingPromotion) {
      return { accepted: false, reason: 'WRONG_PHASE', state: getState() };
    }

    if (!state.pendingPromotion.choices.includes(piece)) {
      return { accepted: false, reason: 'INVALID_PROMOTION', state: getState() };
    }

    const { from, to } = state.pendingPromotion;
    const result = domain.makeMove({ from, to, promotion: piece });
    if (!result.accepted) {
      return { ...result, state: getState() };
    }

    return applyAcceptedMove(result, GAME_EVENTS.PROMOTION_COMPLETED);
  }

  function reset() {
    domain = createDomain(createInitialGameState().fen);
    state = createInitialGameState();
    publish();
    return getState();
  }

  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('Listener must be a function');
    }
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return Object.freeze({
    getState,
    handlePlayerMove,
    choosePromotion,
    reset,
    subscribe,
  });
}
