import React, { useState } from 'react';
import './Board.css';
import Piece from '../Piece/Piece'; 

const Board = () => {
  const startingPosition = [
    ['black-rook', 'black-knight', 'black-bishop', 'black-queen', 'black-king', 'black-bishop', 'black-knight', 'black-rook'],
    ['black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn'],
    ['white-rook', 'white-knight', 'white-bishop', 'white-queen', 'white-king', 'white-bishop', 'white-knight', 'white-rook']
  ];

  const [boardState, setBoardState] = useState(startingPosition);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState('white');

  const handleSquareClick = (rowIndex, colIndex) => {
    const pieceType = boardState[rowIndex][colIndex];
    const currentPiece = { rowIndex, colIndex, pieceType };


    // Check if it's the current player's turn
    if (currentPlayer === 'white') {
      if (selectedPiece && currentPiece && selectedPiece.pieceType == null && currentPiece.pieceType == null) {
        // deselect if empty space was selected first and then second position is also empty space
        setSelectedSquare(null);
        setSelectedPiece(null);
        return;
      }
      // this case is to move piece to black if already a valid piece is selected
      else if (selectedPiece ) {
        // Deselect if the same square is clicked again
        if (selectedSquare && selectedSquare.rowIndex === rowIndex && selectedSquare.colIndex === colIndex) {
          setSelectedSquare(null);
          setSelectedPiece(null);
          return; // Exit the function
        }
        // Highlight the clicked square
        setSelectedSquare({ rowIndex, colIndex });

        // Select the piece
        setSelectedPiece(currentPiece);
      
      }
      // Check if the clicked square contains the current player's piece
      else if ( pieceType == null || pieceType.startsWith('white')) {
        // Deselect if the same square is clicked again
        if (selectedSquare && selectedSquare.rowIndex === rowIndex && selectedSquare.colIndex === colIndex) {
          setSelectedSquare(null);
          setSelectedPiece(null);
          return; // Exit the function
        }

        // Highlight the clicked square
        setSelectedSquare({ rowIndex, colIndex });

        // Select the piece
        setSelectedPiece(currentPiece);
      
      } else {
        // If the clicked square does not contain the current player's piece, return
        return;
      }
    } else {
      // If it's not the current player's turn, return
      console.log("not user's turn")
      return;
    }
    console.log(currentPiece)
    console.log(currentPlayer)
    console.log(selectedPiece)
    // If there's a selected piece and it's the current player's turn
    if ( currentPlayer === 'white') {
      console.log('move triggered',selectedPiece, currentPiece)
      //do not move if valid piece is not selected yet
      if(!selectedPiece){
        return
      }
      // Move the selected piece to the clicked square if it's empty or contains the opponent's piece
      if (pieceType == null  || !pieceType.startsWith('white')) {
        movePiece(selectedPiece, currentPiece);
      }
    }
  };

  const movePiece = (source, target) => {
    // Get the piece type of the source position
    const pieceType = boardState[source.rowIndex][source.colIndex];

    // Create a copy of the current board state
    const newBoardState = [...boardState];

    // Update the board state to reflect the move
    newBoardState[target.rowIndex][target.colIndex] = pieceType;
    newBoardState[source.rowIndex][source.colIndex] = null;

    // Log the move
    console.log(`Move piece from (${source.rowIndex}, ${source.colIndex}) to (${target.rowIndex}, ${target.colIndex})`);

    // Update the board state with the new position
    setBoardState(newBoardState);

    // Reset selectedPiece and selectedSquare
    setSelectedPiece(null);
    setSelectedSquare(null);

    // Switch the turn to the CPU's turn
    setCurrentPlayer('black');

    // Perform CPU move (you can implement CPU logic here)
    setTimeout(() => {
      performCPUMove();
    }, 1000); // Delay CPU move for 1 second (for demonstration)
  };

  const performCPUMove = () => {
    // Implement CPU move logic here
    console.log('CPU move performed');

    // Switch the turn back to the user's turn
    setCurrentPlayer('white');
  };

  return (
    <div className="board">
      <div className="turn-indicator">
        {currentPlayer === 'white' ? 'User\'s Turn' : 'CPU\'s Turn'}
      </div>
      {boardState.map((row, rowIndex) => (
        <div key={rowIndex} className="board-row">
          {row.map((pieceType, colIndex) => {
            const isSelected = selectedSquare && selectedSquare.rowIndex === rowIndex && selectedSquare.colIndex === colIndex;
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`square ${colIndex % 2 === rowIndex % 2 ? 'white' : 'black'} ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSquareClick(rowIndex, colIndex)}
              >
                {pieceType && (
                  <Piece
                    type={pieceType}
                    selected={selectedPiece && selectedPiece.rowIndex === rowIndex && selectedPiece.colIndex === colIndex}
                  />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Board;
