import React, { useEffect, useRef } from 'react';
import { useCircuitStore } from '../store/circuitStore';
import { AlertTriangle, XCircle } from 'lucide-react';

export const ValidationPanel: React.FC = () => {
  const { validationErrors, clearValidation } = useCircuitStore();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        clearValidation();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [clearValidation]);

  if (!validationErrors.length) return null;

  return (
    <div 
      ref={panelRef}
      className="absolute bottom-4 right-4 w-80 bg-white rounded-lg shadow-lg p-4"
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Circuit Validation</h3>
      </div>
      <div className="space-y-2">
        {validationErrors.map((error, index) => (
          <div
            key={index}
            className={`flex items-start gap-2 p-2 rounded ${
              error.type === 'error' ? 'bg-red-50' : 'bg-yellow-50'
            }`}
          >
            {error.type === 'error' ? (
              <XCircle className="text-red-500 mt-1" size={16} />
            ) : (
              <AlertTriangle className="text-yellow-500 mt-1" size={16} />
            )}
            <span className={error.type === 'error' ? 'text-red-700' : 'text-yellow-700'}>
              {error.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};