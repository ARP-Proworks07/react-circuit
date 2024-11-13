import React from 'react';
import { SaveButton } from './SaveButton';
import { LoadButton } from './LoadButton';
import { ExportButton } from './ExportButton';

export const MenuBar: React.FC = () => {
    return (
        <div className="fixed top-0 left-0 right-0 h-14 bg-white border-b px-4 flex items-center justify-between z-50">
            <div className="flex items-center gap-4">
                <SaveButton />
                <LoadButton />
                <ExportButton />
            </div>
        </div>
    );
}; 