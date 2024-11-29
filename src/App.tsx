import React from 'react';
import CircuitCanvas from './components/CircuitCanvas';
import ComponentPalette from './components/ComponentPalette';
import { GRID_SIZE } from './types/Circuit';
import { GitBranch } from 'lucide-react';

const App: React.FC = () => {
  return (
    <div className="flex flex-col h-screen w-full">
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
        {/* Component Palette with Scrollable Area */}
        <div className="component-palette-container">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Components</h3>
          </div>
          
          {/* Scrollable Component List */}
          <div className="component-list-scroll">
            <ComponentPalette />
          </div>
        </div>

        {/* Canvas with Scrollbars */}
        <div className="canvas-scroll-container">
          <CircuitCanvas />
        </div>
      </div>
    </div>
  );
};

export default App;