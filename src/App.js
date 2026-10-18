import React from 'react';
import Board from './components/Board/Board';

function App() {
  return (
    <main className="App">
      <h1>Chess Game</h1>
      <p className="app-subtitle">Play White against the computer</p>
      <Board />
    </main>
  );
}

export default App;
