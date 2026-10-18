import { Chess } from 'chess.js';

const PROMOTION_PIECES = new Set(['q', 'r', 'b', 'n']);
const PROMOTION_ORDER = ['q', 'r', 'b', 'n'];

function getOutcome(game) {
  if (game.isCheckmate()) {
    return {
      status: 'checkmate',
      winner: game.turn() === 'w' ? 'b' : 'w',
      inCheck: true,
    };
  }

  if (game.isStalemate()) {
    return { status: 'stalemate', winner: null, inCheck: false };
  }

  if (game.isDraw()) {
    return {
      status: 'draw',
      winner: null,
      inCheck: game.isCheck(),
    };
  }

  return { status: 'ongoing', winner: null, inCheck: game.isCheck() };
}

/**
 * Creates a narrow, testable API around chess.js. The mutable Chess instance
 * remains private to this adapter.
 */
export function createChessDomain(initialFen) {
  const game = initialFen ? new Chess(initialFen) : new Chess();

  const getLegalMoves = (square) => {
    const moves = game.moves({ verbose: true });
    return square ? moves.filter((move) => move.from === square) : moves;
  };

  const getSnapshot = () => ({
    fen: game.fen(),
    turn: game.turn(),
    board: game.board(),
    moveHistory: game.history(),
    outcome: getOutcome(game),
  });

  const makeMove = ({ from, to, promotion } = {}) => {
    if (!from || !to) {
      return { accepted: false, reason: 'INVALID_MOVE' };
    }

    const legalMoves = game.moves({ verbose: true });
    const matchingMoves = legalMoves.filter(
      (move) => move.from === from && move.to === to,
    );

    if (matchingMoves.length === 0) {
      return { accepted: false, reason: 'ILLEGAL_MOVE' };
    }

    const requiresPromotion = matchingMoves.some((move) => Boolean(move.promotion));
    if (requiresPromotion && !promotion) {
      return {
        accepted: false,
        reason: 'PROMOTION_REQUIRED',
        choices: PROMOTION_ORDER.filter((piece) =>
          matchingMoves.some((move) => move.promotion === piece),
        ),
      };
    }

    if (requiresPromotion && !PROMOTION_PIECES.has(promotion)) {
      return { accepted: false, reason: 'INVALID_PROMOTION' };
    }

    if (!requiresPromotion && promotion) {
      return { accepted: false, reason: 'INVALID_PROMOTION' };
    }

    const candidate = matchingMoves.find(
      (move) => (move.promotion || undefined) === (promotion || undefined),
    );
    if (!candidate) {
      return { accepted: false, reason: 'ILLEGAL_MOVE' };
    }

    try {
      const move = game.move({ from, to, ...(promotion ? { promotion } : {}) });
      return {
        accepted: true,
        move,
        snapshot: getSnapshot(),
      };
    } catch {
      // Keep the adapter's public contract stable if chess.js rejects a move.
      return { accepted: false, reason: 'ILLEGAL_MOVE' };
    }
  };

  return Object.freeze({
    getFen: () => game.fen(),
    getTurn: () => game.turn(),
    getBoard: () => game.board(),
    getHistory: () => game.history(),
    getLegalMoves,
    getOutcome: () => getOutcome(game),
    getSnapshot,
    makeMove,
  });
}
