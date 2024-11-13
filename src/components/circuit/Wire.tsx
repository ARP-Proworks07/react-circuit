import React, { useState } from 'react';
import { Point } from '../../types/Circuit';
import { useCircuitStore } from '../../store/circuitStore';
import { Trash2 } from 'lucide-react';

interface WireProps {
  id: string;
  points: Point[];
  isSelected: boolean;
  onSelect: () => void;
}

export const Wire: React.FC<WireProps> = ({ id, points, isSelected, onSelect }) => {
  const deleteWire = useCircuitStore(state => state.deleteWire);
  const [isHovered, setIsHovered] = useState(false);

  // Create path from points
  const pathData = points.reduce((path, point, index) => {
    return path + (index === 0 ? `M ${point.x} ${point.y}` : ` L ${point.x} ${point.y}`);
  }, '');

  // Calculate midpoint for delete button
  const midPointIndex = Math.floor(points.length / 2);
  const midPoint = points[midPointIndex];

  return (
    <g 
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <path
        d={pathData}
        stroke={isSelected || isHovered ? '#2563eb' : '#000'}
        strokeWidth={isSelected || isHovered ? 2 : 1}
        fill="none"
        className="transition-colors duration-150"
      />
      
      {/* Delete button - show when wire is selected or hovered */}
      {(isSelected || isHovered) && (
        <g
          transform={`translate(${midPoint.x - 10}, ${midPoint.y - 10})`}
          onClick={(e) => {
            e.stopPropagation();
            deleteWire(id);
          }}
          className="cursor-pointer"
        >
          <circle
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
      )}
    </g>
  );
};