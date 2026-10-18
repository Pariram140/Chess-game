import React from 'react';
import { render } from '@testing-library/react';
import Piece from './Piece';

describe('Piece', () => {
  test.each(['white-k', 'white-q', 'white-r', 'white-b', 'white-n', 'white-p',
    'black-k', 'black-q', 'black-r', 'black-b', 'black-n', 'black-p'])(
    'renders a consistent vector silhouette for %s', (type) => {
      const { container } = render(<Piece type={type} />);
      expect(container.querySelector('.piece svg')).toBeInTheDocument();
      expect(container.querySelectorAll('.piece-silhouette path, .piece-silhouette circle').length).toBeGreaterThan(0);
    },
  );

  test('does not render an unknown piece code', () => {
    const { container } = render(<Piece type="white-x" />);
    expect(container.querySelector('.piece')).not.toBeInTheDocument();
  });
});
