import React from 'react';
import { Save, Download, Trash2, Grid, Undo2, Redo2, FileDown, Scissors, Hand } from 'lucide-react';

interface ToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  onToggleGrid: () => void;
  showGrid: boolean;
  onValidate: () => void;
  onSave: () => void;
  onLoad: () => void;
  onExport: () => void;
  onClear: () => void;
  onToggleSnipping: () => void;
  isSnipping: boolean;
  onTogglePan: () => void;
  isPanToolActive: boolean;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onUndo,
  onRedo,
  onToggleGrid,
  showGrid,
  onValidate,
  onSave,
  onLoad,
  onExport,
  onClear,
  onToggleSnipping,
  isSnipping,
  onTogglePan,
  isPanToolActive,
  zoomLevel,
  onZoomIn,
  onZoomOut,
}) => {
  return (
    <div className="toolbar-container">
      <div className="flex flex-wrap gap-2 items-center">
        {/* All tools in one group */}
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={onUndo}
            className="toolbar-btn bg-gray-500 text-white hover:bg-gray-600"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={18} />
          </button>

          <button
            onClick={onRedo}
            className="toolbar-btn bg-gray-500 text-white hover:bg-gray-600"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 size={18} />
          </button>

          <button
            onClick={onToggleGrid}
            className={`toolbar-btn ${
              showGrid ? 'bg-blue-500 text-white' : 'bg-gray-200'
            } hover:bg-opacity-90`}
            title="Toggle Grid"
          >
            <Grid size={18} />
          </button>

          <button
            onClick={onValidate}
            className="toolbar-btn bg-green-500 text-white hover:bg-green-600"
            title="Validate Circuit"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </button>

          <button
            onClick={onSave}
            className="toolbar-btn bg-blue-500 text-white hover:bg-blue-600"
            title="Save Circuit"
          >
            <Save size={18} />
          </button>

          <button
            onClick={onLoad}
            className="toolbar-btn bg-blue-500 text-white hover:bg-blue-600"
            title="Load Circuit"
          >
            <Download size={18} />
          </button>

          <button
            onClick={onExport}
            className="toolbar-btn bg-blue-500 text-white hover:bg-blue-600"
            title="Export as PNG"
          >
            <FileDown size={18} />
          </button>

          <button
            onClick={onClear}
            className="toolbar-btn bg-red-500 text-white hover:bg-red-600"
            title="Clear Circuit"
          >
            <Trash2 size={18} />
          </button>

          {/* Moved snip and pan here */}
          <button
            onClick={onToggleSnipping}
            className={`toolbar-btn ${
              isSnipping ? 'bg-blue-500 text-white' : 'bg-gray-200'
            } hover:bg-opacity-90`}
            title="Snipping Tool"
          >
            <Scissors size={18} />
          </button>

          <button
            onClick={onTogglePan}
            className={`toolbar-btn ${
              isPanToolActive ? 'bg-blue-500 text-white' : 'bg-gray-200'
            } hover:bg-opacity-90`}
            title="Pan Tool"
          >
            <Hand size={18} />
          </button>

          {/* Zoom controls */}
          <button
            onClick={onZoomOut}
            className="toolbar-btn bg-gray-500 text-white hover:bg-gray-600"
            title="Zoom Out"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </button>

          <span className="px-2 py-1 bg-gray-100 rounded text-sm font-medium min-w-[60px] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>

          <button
            onClick={onZoomIn}
            className="toolbar-btn bg-gray-500 text-white hover:bg-gray-600"
            title="Zoom In"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              <line x1="11" y1="8" x2="11" y2="14"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar; 