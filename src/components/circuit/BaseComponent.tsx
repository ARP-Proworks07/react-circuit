/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState, useEffect, SVGProps, useRef, useCallback } from 'react';
import { Point, GRID_SIZE } from '../../types/Circuit';
import { useCircuitStore } from '../../store/circuitStore';
import { Trash2, RotateCw, RotateCcw } from 'lucide-react';

export interface BaseComponentProps {
  id: string;
  x: number;
  y: number;
  rotation: number;
  value?: string;
  isSelected: boolean;
  onSelect: () => void;
  onDoubleClick: () => void;
  onDelete: () => void;
  onRotate: () => void;
  onStartWire: (terminal: Point) => void;
  onCompleteWire: (terminal: Point) => void;
  controlsOffset?: number;
}

interface TerminalElementProps extends SVGProps<SVGCircleElement> {
  cx?: number;
  cy?: number;
  className?: string;
  onMouseDown?: (e: React.MouseEvent<SVGCircleElement, MouseEvent>) => void;
  onMouseUp?: (e: React.MouseEvent<SVGCircleElement, MouseEvent>) => void;
}

export interface BaseComponentProps {
  id: string;
  x: number;
  y: number;
  rotation: number;
  isSelected: boolean;
  onSelect: () => void;
  onDoubleClick: () => void;
  onDelete: () => void;
  onRotate: () => void;
  onStartWire: (point: Point) => void;
  onCompleteWire: (point: Point) => void;
  value?: string;
  controlsOffset?: number;
  controlsPosition?: 'default' | 'bottom';
}

export const BaseComponent: React.FC<BaseComponentProps & { children: React.ReactNode }> = ({
  id,
  x,
  y,
  rotation,
  isSelected,
  onSelect,
  onDoubleClick,
  onDelete,
  onRotate,
  onStartWire,
  onCompleteWire,
  controlsOffset = 20,
  controlsPosition = 'default',
  children,
}) => {
  const [isDragging, setIsDragging] = useState(false);  // State and refs for dragging
  const updateComponent = useCircuitStore(state => state.updateComponent);
  const initialMouseRef = useRef<Point | null>(null);
  const initialPositionRef = useRef<Point | null>(null);
  const draggingWire = useCircuitStore(state => state.draggingWire);

  // Mouse position calculation
  const getMousePosition = (e: MouseEvent | React.MouseEvent): Point | null => {
    const svg = document.querySelector('svg');
    if (!svg) return null;

    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    
    return point.matrixTransform(ctm.inverse());
  };

  // Start dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; //only responsible for left clicks
    e.stopPropagation();

    const mousePos = getMousePosition(e);
    if (!mousePos) return;

    // Store initial positions
    initialMouseRef.current = mousePos;
    initialPositionRef.current = { x, y };

    setIsDragging(true);
    onSelect();
  };

  // Dragging effect
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const currentMouse = getMousePosition(e);
      if (!currentMouse || !initialMouseRef.current || !initialPositionRef.current) return;

      // Calculate the offset from where the user initially clicked on the component
      const offsetX = currentMouse.x - initialMouseRef.current.x;
      const offsetY = currentMouse.y - initialMouseRef.current.y;

      // Apply the offset to the initial position
      const newPosition: Point = {
        x: Math.round((initialPositionRef.current.x + offsetX) / GRID_SIZE) * GRID_SIZE,
        y: Math.round((initialPositionRef.current.y + offsetY) / GRID_SIZE) * GRID_SIZE
      };

      // Update component position
      updateComponent(id, { position: newPosition });
    };

    // End dragging
    const handleMouseUp = () => {
      setIsDragging(false);
      initialMouseRef.current = null;
      initialPositionRef.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, id, updateComponent]);

  const handleTerminalMouseDown = (e: React.MouseEvent<SVGCircleElement, MouseEvent>, terminal: Point) => {
    e.stopPropagation();
    if (!draggingWire) {
      const adjustedTerminal = {
        x: x + terminal.x,
        y: y + terminal.y
      };
      onStartWire(adjustedTerminal);
    }
  };

  const handleTerminalMouseUp = (e: React.MouseEvent<SVGCircleElement, MouseEvent>, terminal: Point) => {
    e.stopPropagation();
    if (draggingWire && draggingWire.from) {
      const adjustedTerminal = {
        x: x + terminal.x,
        y: y + terminal.y
      };
      onCompleteWire(adjustedTerminal);
    }
  };

  const transformValue = `translate(${x}, ${y})`;

  return (
    <g
      transform={transformValue}
      onMouseDown={handleMouseDown}
      onDoubleClick={(e: React.MouseEvent<SVGGElement>) => {
        e.stopPropagation();
        onDoubleClick();
      }}
      className={`cursor-grab ${isDragging ? 'cursor-grabbing' : ''} transition-transform duration-150 ease-out hover:opacity-80`}
    >
      <g transform={`rotate(${rotation})`} className="component-body">
        {React.Children.map(children, child => {
          if (React.isValidElement(child) && child.props.className?.includes('terminal')) {
            return React.cloneElement(child as React.ReactElement<TerminalElementProps>, {
              onMouseDown: (e: React.MouseEvent<SVGCircleElement, MouseEvent>) => handleTerminalMouseDown(e, { 
                x: Number(child.props.cx) || 0, 
                y: Number(child.props.cy) || 0 
              }),
              onMouseUp: (e: React.MouseEvent<SVGCircleElement, MouseEvent>) => handleTerminalMouseUp(e, { 
                x: Number(child.props.cx) || 0, 
                y: Number(child.props.cy) || 0 
              }),
              className: `terminal ${draggingWire ? 'cursor-crosshair' : ''} hover:fill-blue-500 transition-colors duration-150`,
              style: { pointerEvents: 'all' }
            });
          } 
          return child;
        })}
      </g>
      {isSelected && (
        <g className="component-controls">
          {controlsPosition === 'bottom' ? (
            <>
              <g
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="cursor-pointer"
                transform={`translate(0, ${controlsOffset})`}
              >
                <circle
                  cx="0"
                  cy="0"
                  r="10"
                  fill="white"
                  stroke="#ef4444"
                  strokeWidth="2"
                  className="hover:stroke-red-400 transition-colors duration-150"
                />
                <g transform="translate(-6, -6) scale(0.6)">
                  <Trash2 color="#ef4444" />
                </g>
              </g>
            </>
          ) : (
            <>
              <g
                onClick={(e: React.MouseEvent<SVGGElement>) => {
                  e.stopPropagation();
                  updateComponent(id, { 
                    rotation: rotation - 90,
                    position: { x, y }
                  });
                }}
                className="cursor-pointer"
              >
                <circle
                  cx="-30"
                  cy="-30"
                  r="10"
                  fill="white"
                  stroke="#2563eb"
                  strokeWidth="2"
                  className="hover:stroke-blue-400 transition-colors duration-150"
                />
                <g transform="translate(-36, -36) scale(0.6)">
                  <RotateCcw color="#2563eb" />
                </g>
              </g>
              <g
                onClick={(e: React.MouseEvent<SVGGElement>) => {
                  e.stopPropagation();
                  updateComponent(id, { 
                    rotation: rotation + 90,
                    position: { x, y }
                  });
                }}
                className="cursor-pointer"
              >
                <circle
                  cx="0"
                  cy="-30"
                  r="10"
                  fill="white"
                  stroke="#2563eb"
                  strokeWidth="2"
                  className="hover:stroke-blue-400 transition-colors duration-150"
                />
                <g transform="translate(-6, -36) scale(0.6)">
                  <RotateCw color="#2563eb" />
                </g>
              </g>
              <g
                onClick={(e: React.MouseEvent<SVGGElement>) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="cursor-pointer"
              >
                <circle
                  cx="30"
                  cy="0"
                  r="10"
                  fill="white"
                  stroke="#ef4444"
                  strokeWidth="2"
                  className="hover:stroke-red-400 transition-colors duration-150"
                />
                <g transform="translate(24, -6) scale(0.6)">
                  <Trash2 color="#ef4444" />
                </g>
              </g>
            </>
          )}
        </g>
      )}
    </g>
  );
};