import React from 'react';
import { render } from '@testing-library/react';
import Piece from './Piece';

describe('Piece', () => {
  test.each([
    ['white-k', 'white'],
    ['white-q', 'white'],
    ['white-r', 'white'],
    ['white-b', 'white'],
    ['white-n', 'white'],
    ['white-p', 'white'],
    ['black-k', 'black'],
    ['black-q', 'black'],
    ['black-r', 'black'],
    ['black-b', 'black'],
    ['black-n', 'black'],
    ['black-p', 'black'],
  ])('renders the correct color class and vector silhouette for %s', (type, color) => {
    const { container } = render(<Piece type={type} />);
    const piece = container.querySelector('.piece');

    expect(piece).toBeInTheDocument();
    expect(piece).toHaveClass(color);
    expect(piece).toHaveClass(type);
    expect(container.querySelector('.piece svg')).toBeInTheDocument();
    expect(container.querySelectorAll('.piece-silhouette path, .piece-silhouette circle').length).toBeGreaterThan(0);
  });

  test('does not render an unknown piece code', () => {
    const { container } = render(<Piece type="white-x" />);
    expect(container.querySelector('.piece')).not.toBeInTheDocument();
  });
});
