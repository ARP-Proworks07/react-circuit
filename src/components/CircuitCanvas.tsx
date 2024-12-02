import React, { useCallback, useRef, useEffect, useState } from 'react';
import { Save, Download, Trash2, Grid, Undo2, Redo2, FileDown, Scissors, Type, Hand, Hash, Circle, Codesandbox, Battery, Waves, BatteryCharging, Zap, Radio, Lightbulb, ToggleLeft, Lamp, GitBranch } from 'lucide-react';
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
import { Text } from './circuit/Text';
import ChatBox from './ChatBox';
import { ACSource } from './circuit/ACSource';
import { DCSource } from './circuit/DCSource';
import Toolbar from './Toolbar';


const CircuitCanvas: React.FC = () => {
  // SVG reference for coordinate transformation
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
    isSnipping,
    snipStart,
    snipEnd,
    toggleSnippingMode,
    setSnipStart,
    setSnipEnd,
    captureSnip,
    addComponent,
    isTextMode,
    toggleTextMode,
    isPanToolActive,
    togglePanTool,
  } = useCircuitStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingValue, setEditingValue] = useState<{
    id: string;
    value: string;
  } | null>(null);

  const [snipPreview, setSnipPreview] = useState<{
    svgData: string;
    width: number;
    height: number;
  } | null>(null);

  const [zoomLevel, setZoomLevel] = useState(1);

  
  const [isPanning, setIsPanning] = useState(false);
  const lastPanPosition = useRef({ x: 0, y: 0 });

  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });

  const [textInput, setTextInput] = useState<{
    position: { x: number; y: number };
    value: string;
  } | null>(null);

  const handleValueEdit = useCallback((id: string, currentValue: string) => {
    const component = currentDesign.components.find(c => c.id === id);
    if (!component) return;

    if (component.type === 'text') {
      // For text components, allow empty values and don't add units
      setEditingValue({ id, value: currentValue || '' });
    } else {
      // Existing logic for other components
      setEditingValue({ id, value: currentValue || '1k' });
    }
  }, [currentDesign.components]);

  const handleValueSave = useCallback((value: string) => {
    if (!editingValue) return;
    
    const component = currentDesign.components.find(c => c.id === editingValue.id);
    if (!component) return;

    if (component.type === 'text') {
      // For text components, save the value as-is
      updateComponent(editingValue.id, { value });
    } else {
      // Existing logic for other components
      updateComponent(editingValue.id, { value: value || '1k' });
    }
    
    setEditingValue(null);
  }, [editingValue, currentDesign.components, updateComponent]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX / zoomLevel;
    pt.y = e.clientY / zoomLevel;
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());

    const snappedPoint = {
      x: Math.round(svgP.x / GRID_SIZE) * GRID_SIZE,
      y: Math.round(svgP.y / GRID_SIZE) * GRID_SIZE,
    };

    setMousePosition(snappedPoint);

    if (draggingWire) {
      updateWire(snappedPoint);
    }
  }, [draggingWire, updateWire, zoomLevel]);

  const handleCanvasMouseUp = useCallback(() => {
    if (draggingWire) {
      cancelWire();
    }
  }, [draggingWire, cancelWire]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    // Handle text placement when in text mode
    if (isTextMode) {
      const svg = svgRef.current;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());

      const snappedPoint = {
        x: Math.round(svgP.x / GRID_SIZE) * GRID_SIZE,
        y: Math.round(svgP.y / GRID_SIZE) * GRID_SIZE,
      };

      setTextInput({
        position: snappedPoint,
        value: ''
      });
      return;
    }

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
  }, [wireMode, addWirePoint, selectComponent, isTextMode, addComponent, toggleTextMode, zoomLevel, panPosition]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        redo();
      } else {
        undo();
      }
    }

    if (e.key === 'Escape') {
      // Clear snip preview and reset snipping state
      setSnipPreview(null);
      // Reset all snipping related states
      useCircuitStore.setState({
        isSnipping: false,
        snipStart: null,
        snipEnd: null
      });
      
      // Handle other escape actions (existing code)
      if (draggingWire) {
        cancelWire();
      } else if (wireMode && isDrawing) {
        useCircuitStore.setState({
          wirePoints: [],
          isDrawing: false
        });
      }
      if (textInput) {
        setTextInput(null);
        toggleTextMode();
      }
    }
  }, [wireMode, completeWirePath, draggingWire, cancelWire, undo, redo, textInput, toggleTextMode]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleComponentDrag = useCallback((id: string, newPosition: Point) => {
    // Simplified - just update the component position
    updateComponent(id, { position: newPosition });
  }, [updateComponent]);

  // Component rendering with position
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
      onDrag: (newPosition: Point) => updateComponent(component.id, { position: newPosition })
    };

    switch (component.type) {
      case 'resistor':
        return <Resistor key={component.id} {...commonProps} />;
      case 'capacitor':
        return <Capacitor key={component.id} {...commonProps} />;
      case 'inductor':
        return <Inductor key={component.id} {...commonProps} />;
      case 'ac_source':
        return <ACSource key={component.id} {...commonProps} />;
      case 'dc_source':
        return <DCSource key={component.id} {...commonProps} />;
      case 'voltage_source':
        return <VoltageSource key={component.id} {...commonProps} />;
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
      case 'text':
        return <Text key={component.id} {...commonProps} />;
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

  // Add snipping tool mouse handlers
  const handleSnippingMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!isSnipping || !svgRef.current) return;
    
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    
    const snappedPoint = {
      x: Math.round(svgP.x / GRID_SIZE) * GRID_SIZE,
      y: Math.round(svgP.y / GRID_SIZE) * GRID_SIZE,
    };
    
    setSnipStart(snappedPoint);
    setSnipEnd(snappedPoint); // Initialize end point to start point
  }, [isSnipping, setSnipStart, setSnipEnd]);

  const handleSnippingMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!isSnipping || !snipStart || !svgRef.current) return;
    
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    
    const snappedPoint = {
      x: Math.round(svgP.x / GRID_SIZE) * GRID_SIZE,
      y: Math.round(svgP.y / GRID_SIZE) * GRID_SIZE,
    };
    
    setSnipEnd(snappedPoint);
    e.preventDefault(); // Prevent text selection while dragging
  }, [isSnipping, snipStart, setSnipEnd]);

  const handleSnippingMouseUp = useCallback(() => {
    if (!isSnipping || !snipStart || !snipEnd || !svgRef.current) return;
    
    const svg = svgRef.current;
    try {
      // Create preview SVG with only the selected area
      const newSvg = svg.cloneNode(true) as SVGElement;
      const x = Math.min(snipStart.x, snipEnd.x);
      const y = Math.min(snipStart.y, snipEnd.y);
      const width = Math.abs(snipEnd.x - snipStart.x);
      const height = Math.abs(snipEnd.y - snipStart.y);

      // Update viewBox to show only the selected area
      newSvg.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);
      newSvg.setAttribute('width', width.toString());
      newSvg.setAttribute('height', height.toString());

      // Remove the selection overlay
      const overlay = newSvg.querySelector('rect[fill="rgba(0, 0, 0, 0.3)"]');
      const selectionRect = newSvg.querySelector('rect[stroke="#2563eb"]');
      if (overlay) overlay.remove();
      if (selectionRect) selectionRect.remove();

      // Convert SVG to string
      const svgData = new XMLSerializer().serializeToString(newSvg);
      
      // Set preview data
      setSnipPreview({ svgData, width, height });
      
      // Reset snipping mode but keep the preview
      useCircuitStore.setState({
        isSnipping: false,
        snipStart: null,
        snipEnd: null
      });
    } catch (error) {
      console.error('Error creating snip preview:', error);
    }
  }, [isSnipping, snipStart, snipEnd]);

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2)); // Max zoom 2x
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5)); // Min zoom 0.5x
  }, []);

  const handlePanStart = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if ((isPanToolActive && e.button === 0) || e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      lastPanPosition.current = { x: e.clientX, y: e.clientY };
      e.preventDefault();
    }
  }, [isPanToolActive]);

  const handlePanMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanning) return;

    const dx = e.clientX - lastPanPosition.current.x;
    const dy = e.clientY - lastPanPosition.current.y;
    
    setPanPosition(prev => ({
      x: prev.x + dx,
      y: prev.y + dy
    }));
    
    lastPanPosition.current = { x: e.clientX, y: e.clientY };
  }, [isPanning]);

  const handlePanEnd = useCallback(() => {
    setIsPanning(false);
  }, []);

  return (
    <div className="relative flex-1 overflow-hidden">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />
      
      <Toolbar
        onUndo={undo}
        onRedo={redo}
        onToggleGrid={toggleGrid}
        showGrid={showGrid}
        onValidate={validateCircuit}
        onSave={saveDesign}
        onLoad={handleLoadClick}
        onExport={handleExport}
        onClear={clearDesign}
        onToggleSnipping={toggleSnippingMode}
        isSnipping={isSnipping}
        onTogglePan={togglePanTool}
        isPanToolActive={isPanToolActive}
        zoomLevel={zoomLevel}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />

      <div className="flex-1 bg-gray-50 p-4 relative">
        <div className="circuit-container bg-white rounded-lg shadow-lg h-full p-4 overflow-hidden"
          onMouseDown={handlePanStart}
          onMouseMove={handlePanMove}
          onMouseUp={handlePanEnd}
          onMouseLeave={handlePanEnd}
          style={{
            cursor: isPanning ? 'grabbing' : isPanToolActive ? 'grab' : 'default'
          }}
        >
          <div style={{ 
            transform: `scale(${zoomLevel}) translate(${panPosition.x}px, ${panPosition.y}px)`, 
            transformOrigin: 'center center',
            transition: isPanning ? 'none' : 'transform 0.2s ease-out',
            width: '100%',
            height: '100%',
            cursor: isPanning ? 'grabbing' : (zoomLevel > 1 ? 'grab' : 'default')
          }}>
            <svg
              ref={svgRef}
              width="100%"
              height="100%"
              viewBox="0 0 800 600"
              className={`border border-gray-200 ${
                isSnipping ? 'cursor-crosshair' : wireMode ? 'cursor-crosshair' : ''
              }`}
              onMouseDown={handleSnippingMouseDown}
              onMouseMove={handleSnippingMouseMove}
              onMouseUp={handleSnippingMouseUp}
              onClick={handleCanvasClick}
              style={{ cursor: isSnipping ? 'crosshair' : 'default' }}
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
              
              {/* Snipping selection overlay */}
              {isSnipping && (
                <>
                  {/* Dark overlay for entire canvas */}
                  <rect
                    x={0}
                    y={0}
                    width="100%"
                    height="100%"
                    fill="rgba(0, 0, 0, 0.3)"
                    style={{ pointerEvents: 'none' }}
                  />
                  
                  {/* Selection area - only show when dragging */}
                  {snipStart && snipEnd && (
                    <rect
                      x={Math.min(snipStart.x, snipEnd.x)}
                      y={Math.min(snipStart.y, snipStart.y)}
                      width={Math.abs(snipEnd.x - snipStart.x)}
                      height={Math.abs(snipEnd.y - snipStart.y)}
                      fill="rgba(37, 99, 235, 0.2)"
                      stroke="#2563eb"
                      strokeWidth="2"
                      strokeDasharray="4"
                      style={{ pointerEvents: 'none' }}
                    />
                  )}
                </>
              )}
            </svg>
          </div>
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
      {snipPreview && (
        <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg">
          <div className="mb-2">
            <div 
              dangerouslySetInnerHTML={{ __html: snipPreview.svgData }} 
              style={{ 
                width: Math.min(200, snipPreview.width), 
                height: Math.min(150, snipPreview.height),
                border: '1px solid #e5e7eb'
              }}
            />
          </div>
          <button
            onClick={() => {
              try {
                const svgBlob = new Blob([snipPreview.svgData], { type: 'image/svg+xml;charset=utf-8' });
                const url = URL.createObjectURL(svgBlob);

                const link = document.createElement('a');
                link.href = url;
                link.download = `circuit-snip-${new Date().toISOString().slice(0,19)}.svg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                
                // Clear preview after download
                setSnipPreview(null);
              } catch (error) {
                console.error('Error downloading snip:', error);
              }
            }}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <FileDown size={16} />
            Download Snip
          </button>
        </div>
      )}

      {/* Text Input Overlay */}
      {textInput && (
        <input
          type="text"
          autoFocus
          value={textInput.value}
          onChange={(e) => setTextInput({ ...textInput, value: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (textInput.value.trim()) {
                addComponent('text', textInput.value, {
                  x: textInput.position.x,
                  y: textInput.position.y
                });
              }
              setTextInput(null);
              toggleTextMode();
            } else if (e.key === 'Escape') {
              setTextInput(null);
              toggleTextMode();
            }
          }}
          onBlur={() => {
            if (textInput.value.trim()) {
              addComponent('text', textInput.value, {
                x: textInput.position.x,
                y: textInput.position.y
              });
            }
            setTextInput(null);
            toggleTextMode();
          }}
          style={{
            position: 'absolute',
            left: `${textInput.position.x}px`,
            top: `${textInput.position.y}px`,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            padding: 0,
            margin: 0,
            transform: 'translate(0, 0)', // Remove any transformations
            fontSize: '14px',
            lineHeight: '1',
            fontFamily: 'inherit'
          }}
        />
      )}

      {/* Add ChatBox at the end */}
      <ChatBox />
    </div>
  );
};

export default CircuitCanvas;