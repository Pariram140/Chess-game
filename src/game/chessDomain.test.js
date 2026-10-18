import { createChessDomain } from './chessDomain';

describe('chess domain adapter', () => {
  test('exposes the initial position without exposing the engine', () => {
    const domain = createChessDomain();
    const snapshot = domain.getSnapshot();

    expect(snapshot.turn).toBe('w');
    expect(snapshot.moveHistory).toEqual([]);
    expect(snapshot.outcome).toEqual({
      status: 'ongoing',
      winner: null,
      inCheck: false,
    });
    expect(domain.getLegalMoves('e2').map((move) => move.to)).toEqual(['e3', 'e4']);
    expect(domain.game).toBeUndefined();
  });

  test('applies a legal move and updates position and history', () => {
    const domain = createChessDomain();

    const result = domain.makeMove({ from: 'e2', to: 'e4' });

    expect(result.accepted).toBe(true);
    expect(result.snapshot.turn).toBe('b');
    expect(result.snapshot.moveHistory).toEqual(['e4']);
    expect(result.snapshot.board[4][4]).toEqual(expect.objectContaining({ type: 'p', color: 'w' }));
  });

  test('rejects an illegal move without mutating position or history', () => {
    const domain = createChessDomain();
    const before = domain.getSnapshot();

    expect(domain.makeMove({ from: 'e2', to: 'e5' })).toEqual({
      accepted: false,
      reason: 'ILLEGAL_MOVE',
    });
    expect(domain.getSnapshot()).toEqual(before);
  });

  test('reports checkmate and the winning side', () => {
    const domain = createChessDomain();

    [
      { from: 'f2', to: 'f3' },
      { from: 'e7', to: 'e5' },
      { from: 'g2', to: 'g4' },
      { from: 'd8', to: 'h4' },
    ].forEach((move) => {
      expect(domain.makeMove(move).accepted).toBe(true);
    });

    expect(domain.getOutcome()).toEqual({
      status: 'checkmate',
      winner: 'b',
      inCheck: true,
    });
    expect(domain.getLegalMoves()).toHaveLength(0);
  });
});
