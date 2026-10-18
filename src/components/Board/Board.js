import React, { useEffect, useRef, useState } from 'react';
import Piece from '../Piece/Piece';
import { createGameController } from '../../game/gameController';
import { createChessDomain } from '../../game/chessDomain';
import { createRandomCpuStrategy } from '../../game/randomCpuStrategy';
import { GAME_PHASES } from '../../game/gameState';
import './Board.css';

const FILES = 'abcdefgh';
const PROMOTION_LABELS = { q: 'queen', r: 'rook', b: 'bishop', n: 'knight' };
const PIECE_NAMES = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };

function describeStatus(state) {
  if (state.phase === GAME_PHASES.CPU_THINKING) return "CPU's turn — thinking…";
  if (state.phase === GAME_PHASES.CPU_ERROR) return `CPU move failed: ${state.cpuError || 'unknown error'}`;
  if (state.phase === GAME_PHASES.PROMOTION_PENDING) return 'Choose a promotion piece';
  if (state.phase === GAME_PHASES.GAME_OVER) {
    if (state.outcome.status === 'checkmate') return state.outcome.winner === 'w' ? 'Checkmate — you win' : 'Checkmate — CPU wins';
    if (state.outcome.status === 'stalemate') return 'Draw — stalemate';
    return 'Draw — game over';
  }
  if (state.outcome.inCheck) return state.turn === 'w' ? "Your turn — you're in check" : "CPU's turn — check";
  return state.turn === 'w' ? "User's turn" : "CPU's turn";
}

function createDefaultController() {
  const randomStrategy = createRandomCpuStrategy();
  const developmentFen = process.env.NODE_ENV !== 'production' ? new URLSearchParams(window.location.search).get('testFen') : null;
  let useDevelopmentFen = Boolean(developmentFen);
  return createGameController({
    createDomain: (fen) => {
      if (useDevelopmentFen) { useDevelopmentFen = false; return createChessDomain(developmentFen); }
      return createChessDomain(fen);
    },
    cpuStrategy: async (request) => {
      await new Promise((resolve) => window.setTimeout(resolve, 350));
      return randomStrategy(request);
    },
  });
}

function Board({ controllerFactory = createDefaultController }) {
  const controllerRef = useRef(null);
  if (!controllerRef.current) controllerRef.current = controllerFactory();
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
    if (selectedSquare === square) { setSelectedSquare(null); return; }
    const result = controller.handlePlayerMove({ from: selectedSquare, to: square });
    if (result.accepted || result.reason === 'PROMOTION_REQUIRED') { setSelectedSquare(null); return; }
    if (piece?.color === 'w') setSelectedSquare(square);
  };

  const resetGame = () => { controller.reset(); setSelectedSquare(null); };
  const choosePromotion = (piece) => {
    const result = controller.choosePromotion(piece);
    if (result.accepted) setSelectedSquare(null);
  };

  const legalTargets = selectedSquare && gameState.turn === 'w' && gameState.phase === GAME_PHASES.PLAYER_TURN
    ? gameState.legalMoves.filter((move) => move.from === selectedSquare)
    : [];
  const targetBySquare = new Map(legalTargets.map((move) => [move.to, move]));
  const checkedKingSquare = gameState.outcome.inCheck
    ? gameState.board.flatMap((row, rowIndex) => row.map((piece, colIndex) =>
      piece?.type === 'k' && piece.color === gameState.turn ? `${FILES[colIndex]}${8 - rowIndex}` : null,
    )).find(Boolean)
    : null;

  return (
    <section className="chess-game" aria-label="Chess game board">
      <div className={`game-status ${gameState.phase === GAME_PHASES.GAME_OVER ? 'is-terminal' : ''} ${gameState.phase === GAME_PHASES.CPU_ERROR ? 'has-error' : ''} ${gameState.phase === GAME_PHASES.PROMOTION_PENDING ? 'is-promotion' : ''}`} role="status" aria-live="polite" aria-atomic="true">
        <span className="status-indicator" aria-hidden="true" />
        <span>{describeStatus(gameState)}</span>
      </div>
      {gameState.phase === GAME_PHASES.GAME_OVER && (
        <div className="terminal-summary" role="group" aria-label="Game result">
          <strong>{gameState.outcome.status === 'checkmate' ? 'Game complete' : 'Game drawn'}</strong>
          <span>{describeStatus(gameState)}. Start a new game whenever you're ready.</span>
        </div>
      )}
      <div className="game-actions" role="group" aria-label="Game actions">
        <button type="button" className="primary-action" onClick={resetGame}>
          <span aria-hidden="true">↻</span> New game
        </button>
      </div>
      {gameState.phase === GAME_PHASES.PROMOTION_PENDING && (
        <div className="promotion-section">
          <p className="promotion-prompt">Your pawn reached the final rank. Choose a piece.</p>
          <div className="promotion-picker" role="group" aria-label="Choose promotion piece">
            {gameState.pendingPromotion.choices.map((piece) => <button type="button" key={piece} onClick={() => choosePromotion(piece)} aria-label={`Promote to ${PROMOTION_LABELS[piece]}`}>{PROMOTION_LABELS[piece]}</button>)}
          </div>
        </div>
      )}
      {gameState.phase === GAME_PHASES.CPU_ERROR && (
        <div className="cpu-recovery" role="group" aria-label="Computer move recovery">
          <p>The board is unchanged. Retry the computer's move or start a new game.</p>
          <button type="button" className="secondary-action" onClick={() => controller.retryCpuMove()}>Retry CPU move</button>
        </div>
      )}
      <div className="board" role="group" aria-label="Chessboard">
        {gameState.board.map((row, rowIndex) => (
          <div className="board-row" key={rowIndex}>
            {row.map((piece, colIndex) => {
              const square = `${FILES[colIndex]}${8 - rowIndex}`;
              const isSelected = selectedSquare === square;
              const targetMove = targetBySquare.get(square);
              const isLastMove = gameState.lastMove && (gameState.lastMove.from === square || gameState.lastMove.to === square);
              const isCheckedKing = checkedKingSquare === square;
              const color = piece ? (piece.color === 'w' ? 'white' : 'black') : null;
              const pieceLabel = piece ? `${color} ${PIECE_NAMES[piece.type]}` : 'empty square';
              const classes = [
                'square',
                (rowIndex + colIndex) % 2 === 0 ? 'dark' : 'light',
                isSelected ? 'selected' : '',
                targetMove ? (piece ? 'legal-capture-target' : 'legal-move-target') : '',
                isLastMove ? 'last-move' : '',
                isCheckedKing ? 'king-in-check' : '',
              ].filter(Boolean).join(' ');
              const extraLabel = [
                isSelected ? 'selected' : '',
                targetMove ? (piece ? 'legal capture available' : 'legal move available') : '',
                isLastMove ? 'last move' : '',
                isCheckedKing ? 'king in check' : '',
              ].filter(Boolean).join(', ');
              return (
                <button type="button" key={square} className={classes}
                  aria-label={`${square} ${pieceLabel}${extraLabel ? `, ${extraLabel}` : ''}`}
                  aria-pressed={isSelected}
                  disabled={gameState.phase !== GAME_PHASES.PLAYER_TURN}
                  onClick={() => handleSquareClick(square)}>
                  {targetMove && !piece && <span className="move-dot" aria-hidden="true" />}
                  {targetMove && piece && <span className="capture-ring" aria-hidden="true" />}
                  {piece && <Piece type={`${color}-${piece.type}`} />}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <section className="move-history-panel" aria-labelledby="move-history-heading">
        <div className="move-history-heading">
          <h3 id="move-history-heading">Move history</h3>
          <span className="move-count">{gameState.moveHistory.length} {gameState.moveHistory.length === 1 ? 'ply' : 'plies'}</span>
        </div>
        {gameState.moveHistory.length ? (
          <ol className="move-history" aria-label="Recorded moves">
            {Array.from({ length: Math.ceil(gameState.moveHistory.length / 2) }, (_, index) => (
              <li className="move-pair" key={index}>
                <span className="move-number">{index + 1}.</span>
                <span className="move-san">{gameState.moveHistory[index * 2]}</span>
                {gameState.moveHistory[index * 2 + 1] && (
                  <span className="move-san">{gameState.moveHistory[index * 2 + 1]}</span>
                )}
              </li>
            ))}
          </ol>
        ) : (
          <p className="empty-move-history">No moves yet. Your opening move starts the record.</p>
        )}
      </section>
    </section>
  );
}
export default Board;
