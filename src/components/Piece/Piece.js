import React from 'react';
import './Piece.css';

const PIECE_NAMES = { k: 'king', q: 'queen', r: 'rook', b: 'bishop', n: 'knight', p: 'pawn' };

const SHAPES = {
  k: <><path d="M46 9V22M39.5 15.5h13" className="piece-cross" /><path d="M34 28c0-7 5-10 12-10s12 3 12 10l-3 8H37z" /><path d="M36 37c-3 4-5 9-6 15l-3 15h38l-3-15c-1-6-3-11-6-15z" /><path d="M25 68h42v8H25zM21 78h50v7H21z" /></>,
  q: <><path d="M28 32 19 17l14 7 13-14 13 14 14-7-9 15-5 11H33z" /><circle cx="19" cy="15" r="3" /><circle cx="46" cy="8" r="3" /><circle cx="73" cy="15" r="3" /><path d="M33 44h26l5 17H28zM25 63h42v8H25zM21 74h50v9H21z" /></>,
  r: <><path d="M27 20h9v9h7v-9h8v9h7v-9h8v20H27z" /><path d="M32 41h28l-3 23H35zM25 65h42v8H25zM21 75h50v9H21z" /></>,
  b: <><path d="M46 10c-10 0-16 8-13 16 2 5 7 8 13 12 6-4 11-7 13-12 3-8-3-16-13-16z" /><path d="M42 12c-1 5-1 9 2 13" className="piece-cut" /><path d="M33 41h26l5 20H28zM25 63h42v8H25zM21 74h50v9H21z" /></>,
  n: <><path d="M28 67c-1-10 2-21 8-29l-6-9c10-1 14-7 15-17 12 6 21 18 19 32l-4 23z" /><path d="M47 19c4 5 8 10 9 17M51 33l-8 3" className="piece-cut" /><circle cx="51" cy="26" r="2.5" className="piece-eye" /><path d="M25 68h42v8H25zM21 78h50v7H21z" /></>,
  p: <><circle cx="46" cy="24" r="12" /><path d="M38 37c-5 5-8 12-8 19l-3 10h38l-3-10c0-7-3-14-8-19zM25 68h42v8H25zM21 78h50v7H21z" /></>,
};

function Piece({ type }) {
  const [color, pieceType] = type.split('-');
  const name = PIECE_NAMES[pieceType];
  if (!name || !['white', 'black'].includes(color)) return null;

  return (
    <span className={`piece ${type}`} aria-hidden="true">
      <svg viewBox="0 0 92 92" focusable="false" aria-hidden="true">
        <g className="piece-silhouette">{SHAPES[pieceType]}</g>
      </svg>
    </span>
  );
}

export default Piece;
