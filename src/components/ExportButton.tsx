import React from 'react';
import { FileDown } from 'lucide-react';
import html2canvas from 'html2canvas';

export const ExportButton: React.FC = () => {
    const handleExport = async () => {
        const circuitContainer = document.querySelector('.circuit-container');
        if (circuitContainer) {
            try {
                const canvas = await html2canvas(circuitContainer as HTMLElement, {
                    backgroundColor: 'white',
                    scale: 2, // Higher resolution
                    logging: false,
                });

                // Convert to PNG and download
                const dataUrl = canvas.toDataURL('image/png');
                const downloadLink = document.createElement('a');
                downloadLink.href = dataUrl;
                downloadLink.download = `circuit-${new Date().toISOString().slice(0,10)}.png`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            } catch (error) {
                console.error('Error exporting circuit:', error);
            }
        }
    };

    return (
        <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded transition-colors"
        >
            <FileDown size={16} />
            <span>Export</span>
        </button>
    );
}; 