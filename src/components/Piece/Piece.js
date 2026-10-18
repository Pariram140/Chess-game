import React from 'react';
import './Piece.css';

const UNICODE_SYMBOLS = {
  white: {
    k: '\u2654',
    q: '\u2655',
    r: '\u2656',
    b: '\u2657',
    n: '\u2658',
    p: '\u2659',
  },
  black: {
    k: '\u265A',
    q: '\u265B',
    r: '\u265C',
    b: '\u265D',
    n: '\u265E',
    p: '\u265F',
  },
};

const Piece = ({ type }) => {
  const [color, pieceType] = type.split('-');
  const symbol = UNICODE_SYMBOLS[color]?.[pieceType] || '';

  return (
    <div className={`piece ${type}`} aria-hidden="true">
      {symbol}
    </div>
  );
};

export default Piece;
