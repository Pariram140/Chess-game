import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the chess game and initial turn indicator', () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: /chess game/i })).toBeInTheDocument();
  expect(screen.getByText(/user's turn/i)).toBeInTheDocument();
});
