/**
 * Returns a CPU strategy that selects uniformly from the supplied legal moves.
 * The random source is injectable so tests can be deterministic.
 */
export function createRandomCpuStrategy({ random = Math.random } = {}) {
  if (typeof random !== 'function') {
    throw new TypeError('random must be a function');
  }

  return ({ legalMoves } = {}) => {
    if (!Array.isArray(legalMoves) || legalMoves.length === 0) {
      return null;
    }

    const sample = random();
    if (!Number.isFinite(sample) || sample < 0 || sample > 1) {
      throw new RangeError('random source must return a number between 0 and 1');
    }

    const index = Math.min(Math.floor(sample * legalMoves.length), legalMoves.length - 1);
    const move = legalMoves[index];
    return {
      from: move.from,
      to: move.to,
      ...(move.promotion ? { promotion: move.promotion } : {}),
    };
  };
}
