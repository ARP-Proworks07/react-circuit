import React from 'react';
import CircuitCanvas from './components/CircuitCanvas';
import ComponentPalette from './components/ComponentPalette';
import { GRID_SIZE } from './types/Circuit';
import { GitBranch } from 'lucide-react';

const App: React.FC = () => {
  React.useEffect(() => {
    const handleResize = () => {
      const isSmall = window.innerWidth <= window.screen.width / 2;
      document.documentElement.setAttribute('data-small', isSmall.toString());
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="flex flex-col h-screen w-full min-w-0 min-h-0">
      {/* Header Section - Responsive height */}
      <div className="bg-white border-b flex-shrink-0">
        <div className="flex items-center gap-3 h-12 px-4 relative header-container">
          <div className="absolute left-4 md:static">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-500 rounded flex items-center justify-center text-white font-bold logo-container">
              CD
            </div>
          </div>
          <h1 className="text-lg md:text-xl font-semibold text-gray-800 flex-1 text-center header-title">
            Circuit Designer
          </h1>
        </div>
      </div>

      {/* Main Content - Flexible height */}
      <div className="flex flex-1 overflow-hidden min-w-0 min-h-0">
        <div className="component-palette-container">
          <div className="component-list-scroll flex-1 overflow-y-auto">
            <ComponentPalette />
          </div>
        </div>

        <div className="canvas-scroll-container flex-1 min-w-0">
          <CircuitCanvas />
        </div>
      </div>
    </div>
  );
};

export default App;