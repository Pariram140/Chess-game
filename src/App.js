import React, { useState } from 'react';
import Board from './components/Board/Board';
import Player from './components/Player/Player';

function App() {
  const [currentPlayer, setCurrentPlayer] = useState('white');

  const handleMove = () => {
    setCurrentPlayer((player) => (player === 'white' ? 'black' : 'white'));
  };

  return (
    <div className="App">
      <h1>Chess Game</h1>
      <Board />
      <Player currentPlayer={currentPlayer} onMove={handleMove} />
    </div>
  );
}

export default App;
