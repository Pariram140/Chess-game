import {
  createInitialGameState,
  GAME_EVENTS,
  GAME_PHASES,
  transitionGamePhase,
} from './gameState';
import { createChessDomain } from './chessDomain';
import { requestCpuMove } from './cpuStrategy';
import { createRandomCpuStrategy } from './randomCpuStrategy';

function cloneSnapshot(snapshot) {
  return {
    fen: snapshot.fen,
    turn: snapshot.turn,
    moveHistory: [...snapshot.moveHistory],
    board: snapshot.board.map((row) => row.map((piece) => (piece ? { ...piece } : null))),
    outcome: { ...snapshot.outcome },
  };
}

export function createGameController({
  createDomain = createChessDomain,
  cpuStrategy = createRandomCpuStrategy(),
} = {}) {
  let domain = createDomain(createInitialGameState().fen);
  let state = { ...createInitialGameState(), lastMove: null };
  const listeners = new Set();
  let generation = 0;

  function getState() {
    return {
      ...state,
      ...cloneSnapshot(domain.getSnapshot()),
      legalMoves: domain.getLegalMoves(),
      lastMove: state.lastMove ? { ...state.lastMove } : null,
      pendingPromotion: state.pendingPromotion
        ? { ...state.pendingPromotion, choices: [...state.pendingPromotion.choices] }
        : null,
    };
  }

  function publish() {
    const nextState = getState();
    listeners.forEach((listener) => listener(nextState));
  }

  function setPhase(event, gameOver = false) {
    state = { ...state, phase: transitionGamePhase(state.phase, event, { gameOver }) };
  }

  async function runCpuTurn(attempt = 0) {
    if (state.phase !== GAME_PHASES.CPU_THINKING || !cpuStrategy) return;
    const requestGeneration = generation;
    try {
      const move = await requestCpuMove(cpuStrategy, {
        fen: domain.getFen(),
        legalMoves: domain.getLegalMoves(),
      });
      if (requestGeneration !== generation || state.phase !== GAME_PHASES.CPU_THINKING) return;

      const result = domain.makeMove(move);
      if (!result.accepted) throw new Error(`CPU move rejected by domain: ${result.reason}`);

      const terminal = result.snapshot.outcome.status !== 'ongoing';
      state = {
        ...state,
        fen: result.snapshot.fen,
        moveHistory: [...result.snapshot.moveHistory],
        lastMove: { from: result.move.from, to: result.move.to },
        selectedSquare: null,
        pendingPromotion: null,
        cpuError: null,
      };
      setPhase(terminal ? GAME_EVENTS.GAME_FINISHED : GAME_EVENTS.CPU_MOVE_ACCEPTED, terminal);
      publish();
    } catch (error) {
      if (requestGeneration !== generation || state.phase !== GAME_PHASES.CPU_THINKING) return;
      const message = error instanceof Error ? error.message : 'CPU strategy failed.';
      if (attempt === 0) {
        state = { ...state, cpuError: `Retrying CPU move: ${message}` };
        publish();
        void runCpuTurn(1);
        return;
      }
      state = { ...state, cpuError: message };
      setPhase(GAME_EVENTS.CPU_MOVE_FAILED);
      publish();
    }
  }

  function applyAcceptedMove(result, event) {
    const terminal = result.snapshot.outcome.status !== 'ongoing';
    state = {
      ...state,
      fen: result.snapshot.fen,
      moveHistory: [...result.snapshot.moveHistory],
      lastMove: { from: result.move.from, to: result.move.to },
      selectedSquare: null,
      pendingPromotion: null,
      cpuError: null,
    };
    setPhase(terminal ? GAME_EVENTS.GAME_FINISHED : event, terminal);
    publish();
    const response = { ...result, state: getState() };

    if (!terminal && state.phase === GAME_PHASES.CPU_THINKING && cpuStrategy) {
      void runCpuTurn();
    }
    return response;
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

    if (!result.accepted) return { ...result, state: getState() };
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
    if (!result.accepted) return { ...result, state: getState() };
    return applyAcceptedMove(result, GAME_EVENTS.PROMOTION_COMPLETED);
  }

  function retryCpuMove() {
    if (state.phase !== GAME_PHASES.CPU_ERROR) {
      return { accepted: false, reason: 'WRONG_PHASE', state: getState() };
    }
    if (!cpuStrategy) {
      return { accepted: false, reason: 'NO_CPU_STRATEGY', state: getState() };
    }
    setPhase(GAME_EVENTS.CPU_RETRY);
    state = { ...state, cpuError: null };
    publish();
    void runCpuTurn();
    return { accepted: true, state: getState() };
  }

  function reset() {
    generation += 1;
    domain = createDomain(createInitialGameState().fen);
    state = { ...createInitialGameState(), lastMove: null };
    publish();
    return getState();
  }

  function subscribe(listener) {
    if (typeof listener !== 'function') throw new TypeError('Listener must be a function');
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return Object.freeze({ getState, handlePlayerMove, choosePromotion, retryCpuMove, reset, subscribe });
}
