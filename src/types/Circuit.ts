export interface Point {
  x: number;
  y: number;
  componentId?: string;
}

export type ComponentType = 
  | 'resistor'
  | 'capacitor'
  | 'inductor'
  | 'voltage_source'
  | 'ac_source'
  | 'dc_source'
  | 'ground'
  | 'diode'
  | 'transistor'
  | 'led'
  | 'switch'
  | 'bulb'
  | 'text';

export interface CircuitComponent {
  id: string;
  type: ComponentType;
  position: Point;
  rotation: number;
  value?: string;
}

export interface Wire {
  id: string;
  points: Point[];
  isFreePath?: boolean;
}

export interface ValidationError {
  type: 'warning' | 'error';
  message: string;
  componentId?: string;
}

export const GRID_SIZE = 20;