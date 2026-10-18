import { createChessDomain } from './chessDomain';

describe('special move regression coverage', () => {
  test('supports kingside castling and records standard notation', () => {
    const domain = createChessDomain('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');

    const result = domain.makeMove({ from: 'e1', to: 'g1' });

    expect(result.accepted).toBe(true);
    expect(result.move.san).toBe('O-O');
    expect(result.snapshot.board[7][6]).toEqual(expect.objectContaining({ type: 'k', color: 'w' }));
    expect(result.snapshot.board[7][5]).toEqual(expect.objectContaining({ type: 'r', color: 'w' }));
  });

  test('supports en passant and removes the captured pawn', () => {
    const domain = createChessDomain('rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3');

    const result = domain.makeMove({ from: 'e5', to: 'd6' });

    expect(result.accepted).toBe(true);
    expect(result.move.san).toBe('exd6');
    expect(result.snapshot.board[2][3]).toEqual(expect.objectContaining({ type: 'p', color: 'w' }));
    expect(result.snapshot.board[3][3]).toBeNull();
    expect(result.snapshot.moveHistory).toEqual(['exd6']);
  });

  test('rejects an invalid promotion choice without changing the position', () => {
    const domain = createChessDomain('4k3/P7/8/8/8/8/8/4K3 w - - 0 1');
    const before = domain.getSnapshot();

    expect(domain.makeMove({ from: 'a7', to: 'a8', promotion: 'k' })).toEqual({
      accepted: false,
      reason: 'INVALID_PROMOTION',
    });
    expect(domain.getSnapshot()).toEqual(before);
  });
});
