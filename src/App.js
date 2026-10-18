import React, { useState } from 'react';
import Board from './components/Board/Board';
import './App.css';

function App() {
  const [guideExpanded, setGuideExpanded] = useState(true);

  return (
    <main className="App">
      <header className="app-header">
        <a className="brand-mark" href="/" aria-label="Chess home">
          <span className="brand-icon" aria-hidden="true">♞</span>
          <span className="brand-name">The Chess Room</span>
        </a>
        <div className="app-heading">
          <p className="eyebrow">A moment of focus</p>
          <h1>Chess Game</h1>
          <p className="app-subtitle">A considered game of strategy. You play White; the computer plays Black.</p>
        </div>
      </header>
      <div className="game-layout">
        <section className="board-panel" aria-label="Play chess">
          <div className="panel-heading">
            <div><p className="eyebrow">Your match</p><h2>Classic game</h2></div>
            <span className="match-badge"><span aria-hidden="true" /> White to move first</span>
          </div>
          <Board />
        </section>
        <aside className="companion-panel" aria-label="Game guide">
          <div className="guide-panel-heading">
            <div className="companion-emblem" aria-hidden="true">♜</div>
            <div>
              <p className="eyebrow">The essentials</p>
              <h2>Make your move.</h2>
            </div>
            <button
              type="button"
              className="guide-toggle"
              aria-expanded={guideExpanded}
              aria-controls="game-guide-content"
              onClick={() => setGuideExpanded((expanded) => !expanded)}
            >
              {guideExpanded ? 'Hide guide' : 'Show guide'}
            </button>
          </div>
          {guideExpanded && (
            <div id="game-guide-content" className="guide-content">
              <p className="companion-copy">Select one of your white pieces, then choose its destination. Legal moves are enforced automatically.</p>
              <div className="guide-divider" />
              <div className="guide-item"><span className="guide-number">01</span><div><h3>Think ahead</h3><p>Every move changes the position. Take your time.</p></div></div>
              <div className="guide-item"><span className="guide-number">02</span><div><h3>Watch the turn</h3><p>The game status shows when the computer is thinking.</p></div></div>
              <div className="companion-footer"><span aria-hidden="true">✦</span> Good games begin with a clear mind.</div>
            </div>
          )}
        </aside>
      </div>
      <footer className="app-footer"><span>THE CHESS ROOM</span><span>Classic play · Quiet focus</span></footer>
    </main>
  );
}
export default App;
