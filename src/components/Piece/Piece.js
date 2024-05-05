// components/Piece.js
import React from 'react';
import './Piece.css';

const Piece = ({ type }) => {
  const getUnicodeSymbol = (pieceName, color) => {
    switch (pieceName) {
      case 'king':
        return color === 'white' ? '\u2654' : '\u265A';
      case 'queen':
        return color === 'white' ? '\u2655' : '\u265B';
      case 'rook':
        return color === 'white' ? '\u2656' : '\u265C';
      case 'bishop':
        return color === 'white' ? '\u2657' : '\u265D';
      case 'knight':
        return color === 'white' ? '\u2658' : '\u265E';
      case 'pawn':
        return color === 'white' ? '\u2659' : '\u265F';
      default:
        return '';
    }
  };

  const [color, pieceName] = type.split('-');

  return (
    <div className={`piece ${type}`}>
      {getUnicodeSymbol(pieceName, color)}
    </div>
  );
};

export default Piece;
