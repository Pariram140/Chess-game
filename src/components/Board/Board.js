import React, { useEffect, useRef, useState } from 'react';
import Piece from '../Piece/Piece';
import { createGameController } from '../../game/gameController';
import { createRandomCpuStrategy } from '../../game/randomCpuStrategy';
import { GAME_PHASES } from '../../game/gameState';
import './Board.css';

const FILES = 'abcdefgh';

function describeStatus(state) {
  if (state.phase === GAME_PHASES.CPU_THINKING) return "CPU's turn — thinking…";
  if (state.phase === GAME_PHASES.CPU_ERROR) return "CPU's turn — move failed";
  if (state.phase === GAME_PHASES.PROMOTION_PENDING) return 'Choose a promotion piece';
  if (state.phase === GAME_PHASES.GAME_OVER) {
    if (state.outcome.status === 'checkmate') {
      return state.outcome.winner === 'w' ? 'Checkmate — you win' : 'Checkmate — CPU wins';
    }
    if (state.outcome.status === 'stalemate') return 'Draw — stalemate';
    return 'Draw — game over';
  }
  if (state.outcome.inCheck) return state.turn === 'w' ? "Your turn — you're in check" : "CPU's turn — check";
  return state.turn === 'w' ? "User's turn" : "CPU's turn";
}

function Board() {
  const controllerRef = useRef(null);
  if (!controllerRef.current) {
    const randomStrategy = createRandomCpuStrategy();
    controllerRef.current = createGameController({
      cpuStrategy: async (request) => {
        await new Promise((resolve) => window.setTimeout(resolve, 350));
        return randomStrategy(request);
      },
    });
  }
  const controller = controllerRef.current;
  const [gameState, setGameState] = useState(() => controller.getState());
  const [selectedSquare, setSelectedSquare] = useState(null);

  useEffect(() => controller.subscribe(setGameState), [controller]);

  const handleSquareClick = (square) => {
    const state = controller.getState();
    if (state.phase !== GAME_PHASES.PLAYER_TURN || state.turn !== 'w') return;

    const piece = state.board[8 - Number(square[1])][FILES.indexOf(square[0])];
    if (!selectedSquare) {
      if (piece?.color === 'w') setSelectedSquare(square);
      return;
    }

    if (selectedSquare === square) {
      setSelectedSquare(null);
      return;
    }

    const result = controller.handlePlayerMove({ from: selectedSquare, to: square });
    if (result.accepted || result.reason === 'PROMOTION_REQUIRED') {
      setSelectedSquare(null);
      return;
    }

    if (piece?.color === 'w') setSelectedSquare(square);
  };

  return (
    <section className="chess-game" aria-label="Chess game board">
      <div className="game-status" role="status" aria-live="polite">{describeStatus(gameState)}</div>
      <div className="board" role="group" aria-label="Chessboard">
        {gameState.board.map((row, rowIndex) => (
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
                  disabled={gameState.phase !== GAME_PHASES.PLAYER_TURN}
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
        <span>{gameState.moveHistory.length ? gameState.moveHistory.join(' ') : 'No moves yet'}</span>
      </div>
    </section>
  );
}

export default Board;
