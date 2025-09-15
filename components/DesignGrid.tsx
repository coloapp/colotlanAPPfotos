import React from 'react';
import { Icon } from './Icon';

interface DesignGridProps {
  designs: string[];
  onSelect: (design: string) => void;
}

const DesignGrid: React.FC<DesignGridProps> = ({ designs, onSelect }) => {
  return (
    <div className="flex flex-col gap-6 w-full">
        <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-white/50 px-4 py-2 rounded-full">
                <div className="bg-sky-500 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold text-lg flex-shrink-0">3</div>
                <h2 className="text-xl font-bold">Elige tu Diseño Favorito</h2>
            </div>
             <p className="text-slate-500 mt-2">Estos diseños fueron generados por IA usando tu producto y logotipo.</p>
        </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {designs.map((design, index) => (
          <div
            key={index}
            className="relative rounded-lg overflow-hidden cursor-pointer border-4 border-transparent hover:border-sky-500 transition-all duration-200 group aspect-square bg-white shadow-sm"
            onClick={() => onSelect(design)}
          >
            <img src={design} alt={`Propuesta de diseño ${index + 1}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center gap-2 text-sky-400">
                    <Icon type="check" className="w-8 h-8"/>
                    <span className="font-semibold text-lg">Seleccionar</span>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DesignGrid;