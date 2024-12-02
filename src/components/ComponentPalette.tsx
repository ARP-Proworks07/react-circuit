import React, { useState, useEffect } from 'react';
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-minimized', isSettingsOpen.toString());
  }, [isSettingsOpen]);

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

  return (
    <>
      <div className={`component-palette-container ${isSettingsOpen ? 'collapsed' : ''}`}>
        <div className="p-2 md:p-4 border-b flex-shrink-0 palette-header">
          <h3 className="text-base md:text-lg font-semibold">Components</h3>
        </div>
        
        <div className="component-list-scroll flex-1 overflow-y-auto">
          {components.map((component) => (
            <button
              key={component.type}
              onClick={() => {
                if (component.type === 'wire') {
                  toggleWireMode();
                } else if (component.type === 'text') {
                  toggleTextMode();
                } else {
                  addComponent(component.type, component.defaultValue);
                }
              }}
              className={`w-full flex items-center gap-2 p-1.5 md:p-2 hover:bg-gray-100 rounded transition-colors text-sm md:text-base ${
                (component.type === 'wire' && wireMode) || (component.type === 'text' && isTextMode)
                  ? 'bg-blue-100 text-blue-700'
                  : ''
              }`}
              title={component.label}
            >
              <div className="flex-shrink-0 flex items-center justify-center" style={{ minWidth: '20px' }}>
                <component.icon size={20} className="md:w-5 md:h-5" />
              </div>
              <span className="truncate component-label transition-opacity duration-200">
                {component.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Settings button and menu for small screens */}
      <button
        className="settings-button"
        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
        title={isSettingsOpen ? "Close Components" : "Open Components"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"/>
          <path d="M12 6v12M6 12h12"/>
        </svg>
      </button>

      <div className={`settings-menu ${isSettingsOpen ? 'open' : ''}`}>
        {components.map((component) => (
          <button
            key={component.type}
            onClick={() => {
              if (component.type === 'wire') {
                toggleWireMode();
              } else if (component.type === 'text') {
                toggleTextMode();
              } else {
                addComponent(component.type, component.defaultValue);
              }
            }}
            className="p-2 hover:bg-gray-100"
            title={component.label}
          >
            <component.icon size={20} />
          </button>
        ))}
      </div>
    </>
  );
};

export default ComponentPalette;