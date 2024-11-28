import React from 'react';
import ComponentPalette from './components/ComponentPalette';
import CircuitCanvas from './components/CircuitCanvas';

function App() {
  return (
    <div className="circuit-layout">
      <div className="component-palette">
        <ComponentPalette />
      </div>
      <div className="circuit-workspace">
        <CircuitCanvas />
      </div>
    </div>
  );
}

export default App;