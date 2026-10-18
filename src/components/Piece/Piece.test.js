import React from 'react';
import { render, screen } from '@testing-library/react';
import Piece from './Piece';

describe('Piece', () => {
  test.each([
    ['white-k', '\u2654'],
    ['white-q', '\u2655'],
    ['white-r', '\u2656'],
    ['white-b', '\u2657'],
    ['white-n', '\u2658'],
    ['white-p', '\u2659'],
    ['black-k', '\u265A'],
    ['black-q', '\u265B'],
    ['black-r', '\u265C'],
    ['black-b', '\u265D'],
    ['black-n', '\u265E'],
    ['black-p', '\u265F'],
  ])('renders %s as a visible chess symbol', (type, symbol) => {
    const { container } = render(<Piece type={type} />);
    expect(container.querySelector('.piece')).toHaveTextContent(symbol);
  });

  test('does not render an unknown piece code', () => {
    const { container } = render(<Piece type="white-x" />);
    expect(container.querySelector('.piece')).toBeEmptyDOMElement();
  });
});
