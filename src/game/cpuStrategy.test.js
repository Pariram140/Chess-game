import {
  createCpuStrategyRequest,
  CpuStrategyError,
  requestCpuMove,
} from './cpuStrategy';

const legalMoves = [
  { from: 'e7', to: 'e5', san: 'e5' },
  { from: 'd7', to: 'd5', san: 'd5' },
];

describe('CPU strategy contract', () => {
  test('provides an immutable position and legal candidate list', () => {
    const request = createCpuStrategyRequest({ fen: 'position', legalMoves });

    expect(request).toEqual({
      fen: 'position',
      legalMoves: [
        { from: 'e7', to: 'e5' },
        { from: 'd7', to: 'd5' },
      ],
    });
    expect(Object.isFrozen(request)).toBe(true);
    expect(Object.isFrozen(request.legalMoves)).toBe(true);
    expect(Object.isFrozen(request.legalMoves[0])).toBe(true);
    expect(request.legalMoves[0].san).toBeUndefined();
  });

  test('accepts a legal move from an asynchronous strategy', async () => {
    const move = await requestCpuMove(
      async ({ fen, legalMoves: candidates }) => {
        expect(fen).toBe('position');
        expect(candidates).toHaveLength(2);
        return { from: 'd7', to: 'd5' };
      },
      { fen: 'position', legalMoves },
    );

    expect(move).toEqual({ from: 'd7', to: 'd5' });
  });

  test('rejects missing strategy and empty legal candidates', async () => {
    await expect(requestCpuMove(null, { fen: 'position', legalMoves })).rejects.toMatchObject({
      code: 'INVALID_STRATEGY',
    });
    await expect(requestCpuMove(() => null, { fen: 'position', legalMoves: [] })).rejects.toMatchObject({
      code: 'NO_LEGAL_MOVES',
    });
  });

  test('surfaces thrown strategy errors with a stable error code', async () => {
    await expect(
      requestCpuMove(() => {
        throw new Error('strategy unavailable');
      }, { fen: 'position', legalMoves }),
    ).rejects.toMatchObject({
      name: 'CpuStrategyError',
      code: 'STRATEGY_FAILED',
      message: 'strategy unavailable',
    });
  });

  test('rejects a strategy result that is not among the legal candidates', async () => {
    await expect(
      requestCpuMove(() => ({ from: 'e7', to: 'e4' }), { fen: 'position', legalMoves }),
    ).rejects.toMatchObject({
      code: 'INVALID_MOVE',
    });
  });

  test('requires a valid position and legal-move array', () => {
    expect(() => createCpuStrategyRequest({ fen: '', legalMoves })).toThrow(CpuStrategyError);
    expect(() => createCpuStrategyRequest({ fen: 'position', legalMoves: null })).toThrow(
      CpuStrategyError,
    );
    expect(() =>
      createCpuStrategyRequest({ fen: 'position', legalMoves: [{ from: 'e7' }] }),
    ).toThrow(CpuStrategyError);
  });
});
