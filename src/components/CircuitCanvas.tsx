import React, { useCallback, useRef, useEffect, useState } from 'react';
import { Save, Download, Trash2, Grid, Undo2, Redo2, FileDown } from 'lucide-react';
import { useCircuitStore } from '../store/circuitStore';
import { CircuitComponent, Point, GRID_SIZE } from '../types/Circuit';
import { Resistor } from './circuit/Resistor';
import { Capacitor } from './circuit/Capacitor';
import { VoltageSource } from './circuit/VoltageSource';
import { Inductor } from './circuit/Inductor';
import { Ground } from './circuit/Ground';
import { Diode } from './circuit/Diode';
import { Transistor } from './circuit/Transistor';
import { LED } from './circuit/LED';
import { Switch } from './circuit/Switch';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ValueEditor } from './circuit/ValueEditor';
import { ValidationPanel } from './ValidationPanel';
import { Wire } from './circuit/Wire';
import Bulb from './circuit/Bulb';
import html2canvas from 'html2canvas';


const CircuitCanvas: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [mousePosition, setMousePosition] = useState<Point | null>(null);
  const {
    currentDesign,
    selectedComponent,
    draggingWire,
    showGrid,
    saveDesign,
    loadDesign,
    clearDesign,
    updateComponent,
    rotateComponent,
    selectComponent,
    deleteComponent,
    updateWire,
    cancelWire,
    startWire,
    completeWire,
    toggleGrid,
    validateCircuit,
    wireMode,
    wirePoints,
    addWirePoint,
    completeWirePath,
    selectedWire,
    toggleWireSelect,
    isDrawing,
    undo,
    redo,
  } = useCircuitStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingValue, setEditingValue] = useState<{
    id: string;
    value: string;
  } | null>(null);

  const handleValueEdit = (componentId: string, currentValue: string) => {
    setEditingValue({ id: componentId, value: currentValue });
  };

  const handleValueSave = (newValue: string) => {
    if (editingValue) {
      updateComponent(editingValue.id, { value: newValue });
      setEditingValue(null);
    }
  };

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());

    const snappedPoint = {
      x: Math.round(svgP.x / GRID_SIZE) * GRID_SIZE,
      y: Math.round(svgP.y / GRID_SIZE) * GRID_SIZE,
    };

    setMousePosition(snappedPoint);

    if (draggingWire) {
      updateWire(snappedPoint);
    }
  }, [draggingWire, updateWire]);

  const handleCanvasMouseUp = useCallback(() => {
    if (draggingWire) {
      cancelWire();
    }
  }, [draggingWire, cancelWire]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    // Only deselect if clicking directly on the canvas background
    if (e.target === e.currentTarget) {
      selectComponent(null);
    }
    
    if (!svgRef.current || !wireMode) return;
    
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());

    const snappedPoint = {
      x: Math.round(svgP.x / GRID_SIZE) * GRID_SIZE,
      y: Math.round(svgP.y / GRID_SIZE) * GRID_SIZE,
    };

    addWirePoint(snappedPoint);
  }, [wireMode, addWirePoint, selectComponent]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        redo();
      } else {
        undo();
      }
    }
    const state = useCircuitStore.getState();
    if (e.key === 'Enter' && state.wireMode && state.isDrawing) {
      completeWirePath();
    } else if (e.key === 'Escape') {
      if (draggingWire) {
        cancelWire();
      } else if (state.isDrawing) {
        useCircuitStore.setState({
          wirePoints: [],
          isDrawing: false
        });
      }
    }
  }, [wireMode, completeWirePath, draggingWire, cancelWire, undo, redo]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const renderGrid = () => {
    if (!showGrid) return null;

    const gridLines = [];
    const width = 800;
    const height = 600;

    for (let x = 0; x <= width; x += GRID_SIZE) {
      gridLines.push(
        <line
          key={`v${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={height}
          stroke="#ddd"
          strokeWidth="0.5"
        />
      );
    }

    for (let y = 0; y <= height; y += GRID_SIZE) {
      gridLines.push(
        <line
          key={`h${y}`}
          x1={0}
          y1={y}
          x2={width}
          y2={y}
          stroke="#ddd"
          strokeWidth="0.5"
        />
      );
    }

    return <g className="grid">{gridLines}</g>;
  };

  const handleComponentDrag = useCallback((id: string, newPosition: Point) => {
    // Simplified - just update the component position
    updateComponent(id, { position: newPosition });
  }, [updateComponent]);

  const renderComponent = (component: CircuitComponent) => {
    const commonProps = {
      id: component.id,
      x: component.position.x,
      y: component.position.y,
      rotation: component.rotation,
      value: component.value,
      isSelected: selectedComponent === component.id,
      onSelect: () => selectComponent(component.id),
      onDoubleClick: () => handleValueEdit(component.id, component.value || ''),
      onDelete: () => deleteComponent(component.id),
      onRotate: () => rotateComponent(component.id),
      onStartWire: (terminal: Point) => startWire(component.id, terminal),
      onCompleteWire: (terminal: Point) => completeWire(component.id, terminal),
      onDrag: (newPosition: Point) => handleComponentDrag(component.id, newPosition),
    };

    switch (component.type) {
      case 'resistor':
        return <Resistor key={component.id} {...commonProps} />;
      case 'capacitor':
        return <Capacitor key={component.id} {...commonProps} />;
      case 'voltage_source':
        return <VoltageSource key={component.id} {...commonProps} />;
      case 'inductor':
        return <Inductor key={component.id} {...commonProps} />;
      case 'ground':
        return <Ground key={component.id} {...commonProps} />;
      case 'diode':
        return <Diode key={component.id} {...commonProps} />;
      case 'transistor':
        return <Transistor key={component.id} {...commonProps} />;
      case 'led':
        return <LED key={component.id} {...commonProps} />;
      case 'switch':
        return <Switch key={component.id} {...commonProps} />;
      case 'bulb':
        return <Bulb key={component.id} {...commonProps} />;
      default:
        console.warn(`Unknown component type: ${component.type}`);
        return null;
    }
  };

  const handleLoadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        loadDesign(file);
        // Reset the file input value so the same file can be loaded again
        e.target.value = '';
    }
  };

  const handleExport = async () => {
    const circuitContainer = document.querySelector('.circuit-container');
    if (circuitContainer) {
        try {
            const canvas = await html2canvas(circuitContainer as HTMLElement, {
                backgroundColor: 'white',
                scale: 2, // Higher resolution
                logging: false,
            });

            // Convert to PNG and download
            const dataUrl = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.href = dataUrl;
            downloadLink.download = `circuit-${new Date().toISOString().slice(0,10)}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        } catch (error) {
            console.error('Error exporting circuit:', error);
        }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />
      
      <div className="bg-white p-4 shadow-sm border-b flex justify-between items-center">
        <h2 className="text-xl font-semibold">Circuit Designer</h2>
        <div className="flex gap-2">
          <button
            onClick={undo}
            className="flex items-center gap-2 px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={18} />
          </button>
          <button
            onClick={redo}
            className="flex items-center gap-2 px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 size={18} />
          </button>
          <button
            onClick={toggleGrid}
            className={`flex items-center gap-2 px-3 py-2 ${
              showGrid ? 'bg-blue-500 text-white' : 'bg-gray-200'
            } rounded hover:bg-opacity-90`}
          >
            <Grid size={18} /> Grid
          </button>
          <button
            onClick={validateCircuit}
            className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Validate
          </button>
          <button
            onClick={saveDesign}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <Save size={18} /> Save
          </button>
          <button
            onClick={handleLoadClick}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <Download size={18} /> Load
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <FileDown size={18} /> Export
          </button>
          <button
            onClick={clearDesign}
            className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            <Trash2 size={18} /> Clear
          </button>
        </div>
      </div>
      
      <div className="flex-1 bg-gray-50 p-4 relative">
        <div className="circuit-container bg-white rounded-lg shadow-lg h-full p-4">
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox="0 0 800 600"
            className={`border border-gray-200 ${wireMode ? 'cursor-crosshair' : ''}`}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            onClick={handleCanvasClick}
          >
            {renderGrid()}
            <g>
              {currentDesign.wires.map((wire) => (
                <Wire
                  key={wire.id}
                  id={wire.id}
                  points={wire.points}
                  isSelected={selectedWire === wire.id}
                  onSelect={() => toggleWireSelect(wire.id)}
                />
              ))}
              {currentDesign.components.map(renderComponent)}
              {wireMode && isDrawing && wirePoints.length > 0 && mousePosition && (
                <path
                  d={`
                    M ${wirePoints[0].x} ${wirePoints[0].y}
                    L ${mousePosition.x} ${mousePosition.y}
                  `}
                  stroke="#2563eb"
                  strokeWidth="2"
                  strokeDasharray="4"
                  fill="none"
                />
              )}
            </g>
          </svg>
        </div>
        <ValidationPanel />
      </div>
      
      {editingValue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <input
              type="text"
              value={editingValue.value}
              onChange={(e) => setEditingValue({ ...editingValue, value: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleValueSave(editingValue.value);
                } else if (e.key === 'Escape') {
                  setEditingValue(null);
                }
              }}
              className="border p-2 rounded"
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleValueSave(editingValue.value)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
              <button
                onClick={() => setEditingValue(null)}
                className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CircuitCanvas;