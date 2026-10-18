export class CpuStrategyError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'CpuStrategyError';
    this.code = code;
  }
}

function copyMove(move) {
  return {
    from: move.from,
    to: move.to,
    ...(move.promotion ? { promotion: move.promotion } : {}),
  };
}

function sameMove(candidate, legalMove) {
  return (
    candidate &&
    candidate.from === legalMove.from &&
    candidate.to === legalMove.to &&
    (candidate.promotion || undefined) === (legalMove.promotion || undefined)
  );
}

/**
 * Build the immutable input passed to a CPU strategy. The strategy receives
 * only a position and legal candidates, never the mutable chess engine.
 */
export function createCpuStrategyRequest({ fen, legalMoves } = {}) {
  if (typeof fen !== 'string' || !fen.trim()) {
    throw new CpuStrategyError('INVALID_POSITION', 'A valid FEN position is required.');
  }
  if (!Array.isArray(legalMoves)) {
    throw new CpuStrategyError('INVALID_LEGAL_MOVES', 'Legal moves must be an array.');
  }

  const candidates = legalMoves.map((move) => {
    if (!move || typeof move.from !== 'string' || typeof move.to !== 'string') {
      throw new CpuStrategyError('INVALID_LEGAL_MOVES', 'Each legal move needs from and to squares.');
    }
    return Object.freeze(copyMove(move));
  });

  return Object.freeze({
    fen,
    legalMoves: Object.freeze(candidates),
  });
}

/**
 * Execute a synchronous or asynchronous strategy and validate its answer
 * against the candidates supplied for this exact position.
 */
export async function requestCpuMove(strategy, position) {
  if (typeof strategy !== 'function') {
    throw new CpuStrategyError('INVALID_STRATEGY', 'CPU strategy must be a function.');
  }

  const request = createCpuStrategyRequest(position);
  if (request.legalMoves.length === 0) {
    throw new CpuStrategyError('NO_LEGAL_MOVES', 'No legal CPU moves are available.');
  }

  let selected;
  try {
    selected = await strategy(request);
  } catch (error) {
    throw new CpuStrategyError(
      'STRATEGY_FAILED',
      error instanceof Error ? error.message : 'CPU strategy failed.',
    );
  }

  const legalMove = request.legalMoves.find((candidate) => sameMove(selected, candidate));
  if (!legalMove) {
    throw new CpuStrategyError('INVALID_MOVE', 'CPU strategy returned a move outside the legal candidates.');
  }

  return { ...legalMove };
}
