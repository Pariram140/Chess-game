import React, { useEffect, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import Piece from '../Piece/Piece';
import './Board.css';

const FILES = 'abcdefgh';

const describeStatus = (game) => {
  if (game.isCheckmate()) {
    return game.turn() === 'w' ? 'Checkmate — CPU wins' : 'Checkmate — you win';
  }
  if (game.isStalemate()) return 'Draw — stalemate';
  if (game.isDraw()) return 'Draw — game over';
  if (game.isCheck()) return game.turn() === 'w' ? "Your turn — you're in check" : "CPU's turn — check";
  return game.turn() === 'w' ? "User's turn" : "CPU's turn";
};

function Board() {
  const gameRef = useRef(new Chess());
  const cpuTimerRef = useRef(null);
  const [position, setPosition] = useState(() => gameRef.current.board());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [status, setStatus] = useState("User's turn");
  const [moveHistory, setMoveHistory] = useState([]);

  useEffect(() => () => window.clearTimeout(cpuTimerRef.current), []);

  const updateFromGame = () => {
    const game = gameRef.current;
    setPosition(game.board());
    setMoveHistory(game.history());
    setStatus(describeStatus(game));
  };

  const scheduleCpuMove = () => {
    window.clearTimeout(cpuTimerRef.current);
    setStatus("CPU's turn — thinking…");
    cpuTimerRef.current = window.setTimeout(() => {
      const game = gameRef.current;
      if (game.isGameOver() || game.turn() !== 'b') return;
      const legalMoves = game.moves();
      if (legalMoves.length === 0) {
        updateFromGame();
        return;
      }
      game.move(legalMoves[Math.floor(Math.random() * legalMoves.length)]);
      updateFromGame();
    }, 350);
  };

  const handleSquareClick = (square) => {
    const game = gameRef.current;
    if (game.isGameOver() || game.turn() !== 'w') return;

    const piece = game.get(square);
    if (!selectedSquare) {
      if (piece?.color === 'w') setSelectedSquare(square);
      return;
    }

    if (selectedSquare === square) {
      setSelectedSquare(null);
      return;
    }

    try {
      game.move({ from: selectedSquare, to: square, promotion: 'q' });
      setSelectedSquare(null);
      updateFromGame();
      if (!game.isGameOver() && game.turn() === 'b') scheduleCpuMove();
    } catch {
      // Invalid moves are rejected by chess.js; allow selecting another white piece.
      if (piece?.color === 'w') setSelectedSquare(square);
    }
  };

  const game = gameRef.current;

  return (
    <section className="chess-game" aria-label="Chess game board">
      <div className="game-status" role="status" aria-live="polite">{status}</div>
      <div className="board" role="group" aria-label="Chessboard">
        {position.map((row, rowIndex) => (
          <div className="board-row" key={rowIndex}>
            {row.map((piece, colIndex) => {
              const square = `${FILES[colIndex]}${8 - rowIndex}`;
              const isSelected = selectedSquare === square;
              const color = piece ? (piece.color === 'w' ? 'white' : 'black') : null;
              const pieceNames = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };
              const pieceLabel = piece ? `${color} ${pieceNames[piece.type]}` : 'empty square';
              return (
                <button
                  type="button"
                  key={square}
                  className={`square ${(rowIndex + colIndex) % 2 === 0 ? 'dark' : 'light'} ${isSelected ? 'selected' : ''}`}
                  aria-label={`${square} ${pieceLabel}`}
                  aria-pressed={isSelected}
                  onClick={() => handleSquareClick(square)}
                >
                  {piece && <Piece type={`${color}-${piece.type}`} />}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="move-history" aria-label="Move history">
        <span className="move-history-label">Moves</span>
        <span>{moveHistory.length ? moveHistory.join(' ') : 'No moves yet'}</span>
      </div>
    </section>
  );
}

export default Board;
