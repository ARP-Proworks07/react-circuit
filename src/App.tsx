import React from 'react';
import CircuitCanvas from './components/CircuitCanvas';
import ComponentPalette from './components/ComponentPalette';
import { GRID_SIZE } from './types/Circuit';

const App: React.FC = () => {
  return (
    <div className="flex flex-col h-screen w-full">
      {/* Blank space of exactly 1 grid row */}
      <div style={{ height: `${GRID_SIZE}px` }} className="bg-white" />

      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="flex items-center gap-3 h-12 px-4 relative">
          <div className="absolute left-4">
            <div className="w-10 h-10 bg-blue-500 rounded flex items-center justify-center text-white font-bold">
              CD
            </div>
          </div>
          <h1 className="text-xl font-semibold text-gray-800 flex-1 text-center">
            Circuit Designer
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <ComponentPalette />
        <CircuitCanvas />
      </div>
    </div>
  );
};

export default App;