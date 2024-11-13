import React from 'react';
import { Save } from 'lucide-react';
import { useCircuitStore } from '../store/circuitStore';

export const SaveButton: React.FC = () => {
    const { saveDesign } = useCircuitStore();

    return (
        <button
            onClick={saveDesign}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded transition-colors"
        >
            <Save size={16} />
            <span>Save Circuit</span>
        </button>
    );
}; 