import React from 'react';
import { useCircuitStore } from '../store/circuitStore';
import { 
  Battery, 
  Zap, 
  Circle, 
  Hash, 
  Codesandbox, 
  Radio, 
  ToggleLeft,
  Lightbulb,
  GitBranch,
  Lamp,
  Type,
  Waves,
  BatteryCharging
} from 'lucide-react';
import { ComponentType } from '../types/Circuit';
import { LucideIcon } from 'lucide-react';

interface ComponentItem {
  type: ComponentType;
  icon: LucideIcon;
  label: string;
  defaultValue?: string;
}

const ComponentPalette: React.FC = () => {
  const { addComponent, toggleWireMode, wireMode, isTextMode, toggleTextMode } = useCircuitStore();

  const components: ComponentItem[] = [
    { type: 'wire' as ComponentType, icon: GitBranch, label: 'Wire Tool' },
    { type: 'resistor', icon: Hash, label: 'Resistor', defaultValue: '1kΩ' },
    { type: 'capacitor', icon: Circle, label: 'Capacitor', defaultValue: '1µF' },
    { type: 'inductor', icon: Codesandbox, label: 'Inductor', defaultValue: '1mH' },
    { type: 'ac_source', icon: Waves, label: 'AC Source', defaultValue: '120V' },
    { type: 'dc_source', icon: BatteryCharging, label: 'DC Source', defaultValue: '5V' },
    { type: 'ground', icon: Zap, label: 'Ground' },
    { type: 'diode', icon: Radio, label: 'Diode' },
    { type: 'transistor', icon: Radio, label: 'Transistor', defaultValue: 'NPN' },
    { type: 'led', icon: Lightbulb, label: 'LED' },
    { type: 'switch', icon: ToggleLeft, label: 'Switch' },
    { type: 'bulb', icon: Lamp, label: 'Bulb' },
    { type: 'text', icon: Type, label: 'Text', defaultValue: 'Text' },
  ];

  const handleComponentClick = (component: ComponentItem) => {
    if (component.type === 'wire') {
      toggleWireMode(); // Toggle wire mode
    } else if (component.type === 'text') {
      toggleTextMode(); // Toggle text mode
    } else {
      addComponent(component.type, component.defaultValue);
    }
  };

  return (
    <div className="w-64 bg-white border-r h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Components</h3>
      </div>

      <div className="border-b" style={{ height: '300px' }}>
        <div className="h-full overflow-y-auto p-4">
          <div className="space-y-2">
            {components.map((component) => (
              <button
                key={component.type}
                onClick={() => handleComponentClick(component)}
                className={`w-full flex items-center gap-2 p-2 hover:bg-gray-100 rounded transition-colors ${
                  (component.type === 'wire' && wireMode) || 
                  (component.type === 'text' && isTextMode) 
                    ? 'bg-blue-100 text-blue-700' 
                    : ''
                }`}
              >
                <component.icon size={20} />
                <span>{component.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 mt-auto">
        <div className="p-3 bg-blue-50 rounded-md">
          <div className="flex items-center gap-2 text-blue-700 mb-2">
            <GitBranch size={20} />
            <span className="font-semibold">Wire Tool Usage</span>
          </div>
          <p className="text-sm text-blue-600">
            To draw wires:
            <ol className="list-decimal ml-4 mt-1">
              <li>Click the Wire Tool button</li>
              <li>Click to start drawing</li>
              <li>Click to add corners</li>
              <li>Press Enter to complete</li>
            </ol>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComponentPalette;