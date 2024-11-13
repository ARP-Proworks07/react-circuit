import { create } from 'zustand';
import { CircuitComponent, Wire, Point, ValidationError } from '../types/Circuit';

const GRID_SIZE = 20; // Match the grid size used throughout the app

interface CircuitState {
  currentDesign: {
    components: CircuitComponent[];
    wires: Wire[];
  }; 
  selectedComponent: string | null;
  draggingWire: {
    from?: {
      componentId: string;
      terminal: Point;
    };
    to?: Point;
  } | null;
  showGrid: boolean;
  validationErrors: ValidationError[];
  wireMode: boolean;
  wirePoints: Point[];
  selectedWire: string | null;
  isDrawing: boolean;
  history: {
    past: Array<{
      components: CircuitComponent[];
      wires: Wire[];
    }>;
    future: Array<{
      components: CircuitComponent[];
      wires: Wire[];
    }>;
  };
  activeComponents: Set<string>;

  // Actions
  selectComponent: (id: string | null) => void;
  addComponent: (type: string, defaultValue?: string) => void;
  updateComponent: (id: string, updates: Partial<CircuitComponent>) => void;
  deleteComponent: (id: string) => void;
  rotateComponent: (id: string) => void;
  startWire: (componentId: string, terminal: Point) => void;
  updateWire: (point: Point) => void;
  completeWire: (componentId: string, terminal: Point) => void;
  cancelWire: () => void;
  toggleGrid: () => void;
  saveDesign: () => void;
  loadDesign: (file: File) => Promise<void>;
  clearDesign: () => void;
  validateCircuit: () => void;
  toggleWireMode: () => void;
  addWirePoint: (point: Point) => void;
  toggleWireSelect: (wireId: string | null) => void;
  completeWirePath: () => void;
  saveToHistory: () => void;
  undo: () => void;
  redo: () => void;
  setComponentActive: (id: string, active: boolean) => void;
  simulateCircuit: () => void;
  deleteWire: (id: string) => void;
  getCircuitJson: () => string;
  clearValidation: () => void;
}

export const useCircuitStore = create<CircuitState>((set, get) => ({
  currentDesign: {
    components: [],
    wires: [],
  },
  selectedComponent: null,
  draggingWire: null,
  showGrid: true,
  validationErrors: [],
  wireMode: false,
  wirePoints: [],
  selectedWire: null,
  isDrawing: false,
  history: {
    past: [],
    future: []
  },
  activeComponents: new Set(),

  selectComponent: (id) => set({ selectedComponent: id }),
  
  addComponent: (type, defaultValue) => {
    get().saveToHistory();
    const position = {
      x: Math.round(400 / 20) * 20, // Default position, snapped to grid
      y: Math.round(300 / 20) * 20
    };

    const newComponent: CircuitComponent = {
      id: `${type}-${Date.now()}`,
      type: type as CircuitComponent['type'],
      position,
      rotation: 0,
      value: defaultValue || (type === 'inductor' ? '1mH' : ''),
    };

    set((state) => ({
      currentDesign: {
        ...state.currentDesign,
        components: [...state.currentDesign.components, newComponent],
      },
      selectedComponent: newComponent.id,
    }));
  },

  updateComponent: (id, updates) => {
    set((state) => ({
      currentDesign: {
        ...state.currentDesign,
        components: state.currentDesign.components.map((component) =>
          component.id === id
            ? {
                ...component,
                ...updates,
                // Use GRID_SIZE constant instead of magic number
                position: updates.position
                  ? {
                      x: Math.round(updates.position.x / GRID_SIZE) * GRID_SIZE,
                      y: Math.round(updates.position.y / GRID_SIZE) * GRID_SIZE,
                    }
                  : component.position,
              }
            : component
        ),
      },
    }));
  },

  deleteComponent: (id) => {
    get().saveToHistory();
    set((state) => ({
      currentDesign: {
        components: state.currentDesign.components.filter((c) => c.id !== id),
        wires: state.currentDesign.wires.filter(
          (w) => !w.points.some(p => p.componentId === id)
        ),
      },
      selectedComponent: state.selectedComponent === id ? null : state.selectedComponent,
    }));
  },

  rotateComponent: (id) => {
    set((state) => ({
      currentDesign: {
        ...state.currentDesign,
        components: state.currentDesign.components.map((component) =>
          component.id === id
            ? { ...component, rotation: (component.rotation + 90) % 360 }
            : component
        ),
      },
    }));
  },

  startWire: (componentId, terminal) => {
    set({
      draggingWire: {
        from: { componentId, terminal },
        to: terminal,
      },
    });
  },

  updateWire: (point: Point) => {
    set((state) => {
      if (!state.draggingWire) return state;
      
      return {
        ...state,
        draggingWire: {
          ...state.draggingWire,
          to: point
        }
      };
    });
  },

  completeWire: (componentId, terminal) => {
    const state = get();
    if (!state.draggingWire?.from) return;

    // Prevent self-connection
    if (state.draggingWire.from.componentId === componentId) {
      set({ draggingWire: null });
      return;
    }

    const newWire: Wire = {
      id: `wire-${Date.now()}`,
      points: [
        state.draggingWire.from.terminal,
        terminal
      ]
    };

    set((state) => ({
      currentDesign: {
        ...state.currentDesign,
        wires: [...state.currentDesign.wires, newWire],
      },
      draggingWire: null,
    }));
  },

  cancelWire: () => set({ draggingWire: null }),

  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),

  saveDesign: () => {
    const jsonString = get().getCircuitJson();
    
    // Create blob and download link
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create temporary download link
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `circuit-design-${new Date().toISOString().slice(0,10)}.json`;
    
    // Trigger download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    
    // Cleanup
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
  },

  loadDesign: async (file: File) => {
    try {
      const text = await file.text();
      const design = JSON.parse(text);

      // Validate the design structure
      if (!design.components || !design.wires || !Array.isArray(design.components) || !Array.isArray(design.wires)) {
        throw new Error('Invalid circuit design file format');
      }

      // Save current state to history before loading
      get().saveToHistory();

      // Create a mapping of old component IDs to new ones
      const idMapping = new Map<string, string>();
      const timestamp = Date.now();
      
      // Generate new components with new IDs
      const newComponents = design.components.map((comp: CircuitComponent, index: number) => {
        const newId = `${comp.type}-${timestamp}-${index}-${Math.random().toString(36).substr(2, 9)}`;
        idMapping.set(comp.id, newId);
        return {
          ...comp,
          id: newId
        };
      });

      // Update wire points with new component IDs
      const newWires = design.wires.map((wire: Wire, index: number) => ({
        ...wire,
        id: `wire-${timestamp}-${index}-${Math.random().toString(36).substr(2, 9)}`,
        points: wire.points.map(point => ({
          ...point,
          componentId: point.componentId ? idMapping.get(point.componentId) : undefined,
          x: Math.round(point.x / GRID_SIZE) * GRID_SIZE,
          y: Math.round(point.y / GRID_SIZE) * GRID_SIZE
        }))
      }));

      // Clear the current design and set the new one
      set({
        currentDesign: {
          components: newComponents,
          wires: newWires
        },
        selectedComponent: null,
        draggingWire: null,
        wireMode: false,
        wirePoints: [],
        selectedWire: null,
        isDrawing: false,
        validationErrors: [],
        activeComponents: new Set()
      });

    } catch (error) {
      console.error('Error loading design:', error);
      set({
        validationErrors: [{
          type: 'error',
          message: 'Failed to load circuit design file'
        }]
      });
    }
  },

  clearDesign: () => set({
    currentDesign: { components: [], wires: [] },
    selectedComponent: null,
    draggingWire: null,
  }),

  validateCircuit: () => {
    const state = get();
    const errors: ValidationError[] = [];
    
    if (state.currentDesign.components.length === 0) {
      errors.push({
        type: 'warning',
        message: 'Circuit is empty',
      });
    }

    // Check for floating components
    state.currentDesign.components.forEach(component => {
      const connectedWires = state.currentDesign.wires.filter(
        wire => wire.points.some(p => p.componentId === component.id)
      );

      if (connectedWires.length === 0) {
        errors.push({
          type: 'warning',
          message: `${component.type} is not connected to any other component`,
          componentId: component.id,
        });
      }
    });

    set({ validationErrors: errors });
  },

  toggleWireMode: () => set(state => ({ 
    wireMode: !state.wireMode,
    wirePoints: [],
    isDrawing: false,
    draggingWire: null,
  })),

  addWirePoint: (point: Point) => {
    const state = get();
    if (!state.wireMode) return;

    if (state.isDrawing) {
      get().saveToHistory();
    }

    const snappedPoint = {
      x: Math.round(point.x / GRID_SIZE) * GRID_SIZE,
      y: Math.round(point.y / GRID_SIZE) * GRID_SIZE
    };

    if (!state.isDrawing) {
      // Start drawing
      set({
        wirePoints: [snappedPoint],
        isDrawing: true
      });
    } else {
      // Complete the wire
      const newWire: Wire = {
        id: `wire-${Date.now()}`,
        points: [...state.wirePoints, snappedPoint],
        isFreePath: true
      };

      set({
        currentDesign: {
          ...state.currentDesign,
          wires: [...state.currentDesign.wires, newWire],
        },
        wirePoints: [],
        isDrawing: false,
      });
    }
  },

  toggleWireSelect: (wireId: string | null) => set(state => ({
    selectedWire: state.selectedWire === wireId ? null : wireId
  })),

  completeWirePath: () => {
    const state = get();
    if (state.wirePoints.length < 2) return;

    const newWire: Wire = {
      id: `wire-${Date.now()}`,
      points: [...state.wirePoints],
      isFreePath: true
    };

    set(state => ({
      currentDesign: {
        ...state.currentDesign,
        wires: [...state.currentDesign.wires, newWire],
      },
      wirePoints: [],
      isDrawing: false,
    }));
  },

  saveToHistory: () => {
    const currentState = get();
    set({
      history: {
        past: [...currentState.history.past, { ...currentState.currentDesign }],
        future: []
      }
    });
  },

  undo: () => {
    const state = get();
    if (state.history.past.length === 0) return;

    const previous = state.history.past[state.history.past.length - 1];
    const newPast = state.history.past.slice(0, -1);

    set(state => ({
      currentDesign: previous,
      history: {
        past: newPast,
        future: [state.currentDesign, ...state.history.future]
      }
    }));
  },

  redo: () => {
    const state = get();
    if (state.history.future.length === 0) return;

    const next = state.history.future[0];
    const newFuture = state.history.future.slice(1);

    set(state => ({
      currentDesign: next,
      history: {
        past: [...state.history.past, state.currentDesign],
        future: newFuture
      }
    }));
  },

  setComponentActive: (id, active) => set(state => ({
    activeComponents: active 
      ? new Set(state.activeComponents).add(id)
      : new Set([...state.activeComponents].filter(x => x !== id))
  })),

  simulateCircuit: () => {
    const state = get();
    const { components, wires } = state.currentDesign;
    
    // Reset all active components
    const activeComponents = new Set<string>();
    
    // Find voltage sources and grounds
    const voltageSources = components.filter(c => c.type === 'voltage_source');
    const grounds = components.filter(c => c.type === 'ground');
    
    // Circuit needs both voltage source and ground to work
    if (voltageSources.length === 0) {
      set({ 
        validationErrors: [{
          type: 'error',
          message: 'Circuit needs at least one voltage source'
        }]
      });
      return;
    }

    if (grounds.length === 0) {
      set({ 
        validationErrors: [{
          type: 'error',
          message: 'Circuit needs at least one ground connection'
        }]
      });
      return;
    }

    // For each voltage source, find connected components
    voltageSources.forEach(source => {
      // Find all components connected to this voltage source
      const connectedComponents = findConnectedComponents(source.id, components, wires);
      
      // Check if there's a path to ground
      const hasGroundPath = connectedComponents.some(id => 
        components.find(c => c.id === id)?.type === 'ground'
      );

      if (hasGroundPath) {
        // If there's a path to ground, activate all components in the path
        connectedComponents.forEach(id => {
          activeComponents.add(id);
          // Find the component
          const component = components.find(c => c.id === id);
          if (component?.type === 'bulb' || component?.type === 'led') {
            activeComponents.add(id);
          }
        });
      }
    });
    
    // Update the store with active components
    set({ 
      activeComponents,
      validationErrors: activeComponents.size === 0 ? [{
        type: 'warning',
        message: 'No complete circuit path found between voltage source and ground'
      }] : []
    });
  },

  deleteWire: (id) => {
    get().saveToHistory();
    set((state) => ({
      currentDesign: {
        ...state.currentDesign,
        wires: state.currentDesign.wires.filter((w) => w.id !== id),
      },
      selectedWire: null,
    }));
  },

  getCircuitJson: () => {
    const state = get();
    const design = {
      components: state.currentDesign.components,
      wires: state.currentDesign.wires,
      version: "1.0"
    };
    
    return JSON.stringify(design, null, 2);
  },

  clearValidation: () => set({ validationErrors: [] }),
}));

// Helper function to find connected components
function findConnectedComponents(
  startId: string, 
  components: CircuitComponent[], 
  wires: Wire[]
): string[] {
  const visited = new Set<string>();
  const queue = [startId];
  
  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (visited.has(currentId)) continue;
    visited.add(currentId);
    
    // Find all wires connected to this component
    const connectedWires = wires.filter(w => 
      w.points.some(p => p.componentId === currentId)
    );
    
    // Find components connected through these wires
    connectedWires.forEach(wire => {
      wire.points.forEach(point => {
        if (point.componentId && !visited.has(point.componentId)) {
          queue.push(point.componentId);
        }
      });
    });
  }
  
  return Array.from(visited);
}