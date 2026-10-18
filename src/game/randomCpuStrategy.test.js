import { createCpuStrategyRequest, requestCpuMove } from './cpuStrategy';
import { createRandomCpuStrategy } from './randomCpuStrategy';

const legalMoves = [
  { from: 'e7', to: 'e5', san: 'e5' },
  { from: 'd7', to: 'd5', san: 'd5' },
  { from: 'g8', to: 'f6', san: 'Nf6' },
];

describe('random CPU strategy', () => {
  test.each([
    [0, { from: 'e7', to: 'e5' }],
    [0.4, { from: 'd7', to: 'd5' }],
    [0.99, { from: 'g8', to: 'f6' }],
    [1, { from: 'g8', to: 'f6' }],
  ])('selects the candidate at random sample %s', (sample, expected) => {
    const strategy = createRandomCpuStrategy({ random: () => sample });
    expect(strategy(createCpuStrategyRequest({ fen: 'position', legalMoves }))).toEqual(expected);
  });

  test('only returns a candidate from the supplied legal list', async () => {
    const strategy = createRandomCpuStrategy({ random: () => 0.5 });
    const move = await requestCpuMove(strategy, { fen: 'position', legalMoves });

    expect(legalMoves.some((candidate) =>
      candidate.from === move.from && candidate.to === move.to
    )).toBe(true);
  });

  test('returns null when invoked directly without candidates', () => {
    const strategy = createRandomCpuStrategy();
    expect(strategy({ legalMoves: [] })).toBeNull();
    expect(strategy({})).toBeNull();
  });

  test('supports promotion candidates without losing the selected piece', () => {
    const strategy = createRandomCpuStrategy({ random: () => 0.99 });
    expect(strategy({
      legalMoves: [
        { from: 'a7', to: 'a8', promotion: 'q' },
        { from: 'a7', to: 'a8', promotion: 'n' },
      ],
    })).toEqual({ from: 'a7', to: 'a8', promotion: 'n' });
  });

  test('rejects a broken random source', () => {
    const strategy = createRandomCpuStrategy({ random: () => NaN });
    expect(() => strategy({ legalMoves })).toThrow(/random source/);
  });
});
