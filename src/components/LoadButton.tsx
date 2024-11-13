import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { useCircuitStore } from '../store/circuitStore';

export const LoadButton: React.FC = () => {
    const { loadDesign } = useCircuitStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                await loadDesign(file);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            } catch (error) {
                console.error('Error loading circuit:', error);
            }
        }
    };

    return (
        <>
            <button
                onClick={handleClick}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded transition-colors"
            >
                <Upload size={16} />
                <span>Load Circuit</span>
            </button>
            <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />
        </>
    );
}; 