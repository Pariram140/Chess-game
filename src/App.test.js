import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

test('renders the chess game and initial position', () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: /chess game/i })).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent(/user's turn/i);
  expect(screen.getByRole('button', { name: 'e2 white pawn' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'e7 black pawn' })).toBeInTheDocument();
});

test('rejects illegal moves and accepts a legal pawn move', () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: 'e2 white pawn' }));
  fireEvent.click(screen.getByRole('button', { name: 'e5 empty square' }));

  expect(screen.getByRole('button', { name: 'e2 white pawn' })).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent(/user's turn/i);

  // The illegal move is rejected and the selected pawn remains selected.
  fireEvent.click(screen.getByRole('button', { name: 'e4 empty square' }));

  expect(screen.getByRole('button', { name: 'e4 white pawn' })).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent(/cpu's turn/i);
});
