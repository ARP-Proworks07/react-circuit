import React from 'react';
import { BaseComponent } from './BaseComponent';
import { useCircuitStore } from '../../store/circuitStore';
import { Point } from '../../types/Circuit';

interface BulbProps {
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
  onDrag: (newPosition: Point) => void;
}

// Change to default export
const Bulb: React.FC<BulbProps> = (props) => {
  const activeComponents = useCircuitStore(state => state.activeComponents);
  const isActive = activeComponents.has(props.id);

  return (
    <BaseComponent {...props}>
      {/* Glow effect when active - placed behind the bulb */}
      {isActive && (
        <g>
          <circle
            cx="0"
            cy="-5"
            r="15"
            fill="#fff5b8"
            opacity="0.3"
            filter="blur(3px)"
          />
        </g>
      )}

      {/* Bulb shape - remains unchanged */}
      <path
        d="M -10 10 L 10 10 L 10 0 C 10 -15 -10 -15 -10 0 Z"
        stroke="black"
        strokeWidth="1.5"
        fill={isActive ? "#ffeb3b" : "white"}
        className="bulb-body"
      />

      {/* Filament */}
      <path
        d="M -5 0 C -5 -5 5 -5 5 0"
        stroke="black"
        strokeWidth="1"
        fill="none"
      />

      {/* Terminal points */}
      <circle
        cx="0"
        cy="10"
        r="2"
        fill="black"
        className="terminal"
      />
      <circle
        cx="0"
        cy="-10"
        r="2"
        fill="black"
        className="terminal"
      />
    </BaseComponent>
  );
};

export default Bulb; 