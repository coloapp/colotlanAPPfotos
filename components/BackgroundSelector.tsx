import React, { useState } from 'react';
import { Icon } from './Icon';
import Spinner from './Spinner';

interface BackgroundSelectorProps {
  backgrounds: string[];
  onSelect: (background: string) => void;
}

const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({ backgrounds, onSelect }) => {
  const [selected, setSelected] = useState<string | null>(null);

  if (backgrounds.length === 0) {
      return <Spinner message="Generando fondos..." />;
  }

  return (
    <div>
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold flex items-center justify-center gap-3"><div className="bg-amber-500 text-gray-900 rounded-full h-8 w-8 flex items-center justify-center font-bold text-lg shrink-0">2</div>Elige tu Fondo Favorito</h2>
            <p className="text-gray-400 mt-2">Haz clic en un fondo para seleccionarlo y continuar.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {backgrounds.map((bg, index) => (
                <div 
                    key={index} 
                    className={`rounded-lg overflow-hidden cursor-pointer border-4 transition-all duration-300 ${selected === bg ? 'border-amber-400 scale-105' : 'border-transparent hover:border-gray-600'}`}
                    onClick={() => onSelect(bg)}
                >
                    <img src={bg} alt={`Fondo generado ${index + 1}`} className="w-full h-64 object-cover" />
                </div>
            ))}
        </div>
    </div>
  );
};

export default BackgroundSelector;