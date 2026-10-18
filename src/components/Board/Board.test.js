import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Board from './Board';
import { createChessDomain } from '../../game/chessDomain';
import { createGameController } from '../../game/gameController';

const PROMOTION_FEN = '4k3/P7/8/8/8/8/8/4K3 w - - 0 1';

describe('Board lifecycle UI', () => {
  test('shows all promotion choices and applies the selected piece', () => {
    render(
      <Board controllerFactory={() => createGameController({
        createDomain: () => createChessDomain(PROMOTION_FEN),
        cpuStrategy: null,
      })} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'a7 white pawn' }));
    fireEvent.click(screen.getByRole('button', { name: 'a8 empty square' }));

    expect(screen.getByRole('group', { name: 'Choose promotion piece' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Promote to queen' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Promote to rook' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Promote to bishop' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Promote to knight' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Promote to knight' }));
    expect(screen.getByRole('button', { name: 'a8 white knight' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/draw/i);
  });

  test('shows CPU error details and exposes manual retry', async () => {
    render(
      <Board controllerFactory={() => createGameController({
        cpuStrategy: async () => { throw new Error('strategy offline'); },
      })} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'e2 white pawn' }));
    fireEvent.click(screen.getByRole('button', { name: 'e4 empty square' }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/strategy offline/i);
    });
    expect(screen.getByRole('button', { name: 'Retry CPU move' })).toBeInTheDocument();
  });

  test('displays checkmate outcome and disables board input', () => {
    render(
      <Board controllerFactory={() => createGameController({
        createDomain: () => createChessDomain('7k/5Q2/6K1/8/8/8/8/8 w - - 0 1'),
        cpuStrategy: null,
      })} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'f7 white queen' }));
    fireEvent.click(screen.getByRole('button', { name: 'g7 empty square' }));

    expect(screen.getByRole('status')).toHaveTextContent(/checkmate/i);
    expect(screen.getByRole('button', { name: 'g7 white queen' })).toBeDisabled();
  });
});


test('reset clears selected-square state and restores the initial position', () => {
  render(<Board controllerFactory={() => createGameController({ cpuStrategy: null })} />);

  const pawn = screen.getByRole('button', { name: 'e2 white pawn' });
  fireEvent.click(pawn);
  expect(pawn).toHaveAttribute('aria-pressed', 'true');

  fireEvent.click(screen.getByRole('button', { name: 'Reset game' }));

  expect(screen.getByRole('button', { name: 'e2 white pawn' })).toHaveAttribute('aria-pressed', 'false');
  expect(screen.getByRole('status')).toHaveTextContent(/user's turn/i);
  expect(screen.getByLabelText('Move history')).toHaveTextContent('No moves yet');
});
