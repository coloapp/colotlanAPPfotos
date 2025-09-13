import React from 'react';
import { Icon } from './Icon';
// Fix: Import shared types from the central types file.
import type { TrainingExample, BackgroundStyle } from '../types';

interface TrainingLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  examples: TrainingExample[];
  setExamples: React.Dispatch<React.SetStateAction<TrainingExample[]>>;
}

const TrainingLibrary: React.FC<TrainingLibraryProps> = ({ isOpen, onClose, examples, setExamples }) => {
    if (!isOpen) return null;

    const handleDelete = (id: string) => {
        // Removed the unreliable window.confirm() call
        const updatedExamples = examples.filter(ex => ex.id !== id);
        setExamples(updatedExamples);
        localStorage.setItem('trainingExamples', JSON.stringify(updatedExamples));
    };

    const styleLabels: Record<BackgroundStyle, string> = {
        watermark: 'Marca de Agua',
        pattern_small: 'Patrón Pequeño',
        pattern_large: 'Patrón Grande',
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in-scale" onClick={onClose}>
            <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl z-10 relative border border-gray-700 flex flex-col overflow-hidden max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-4 flex justify-between items-center border-b border-gray-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        <Icon type="library" className="w-6 h-6" />
                        Biblioteca de Entrenamiento
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700">
                        <Icon type="close" className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 flex-grow overflow-auto">
                    {examples.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                            <Icon type="archive" className="w-24 h-24 mb-4" />
                            <h3 className="text-2xl font-semibold">Tu biblioteca está vacía.</h3>
                            <p className="mt-2 max-w-md">Cuando guardes una imagen generada como ejemplo, aparecerá aquí para futuras referencias.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {examples.map(example => (
                                <div key={example.id} className="bg-gray-800 rounded-lg overflow-hidden group relative border border-gray-700/50">
                                    <img src={example.finalImage} alt="Ejemplo de entrenamiento" className="w-full h-56 object-cover" />
                                    <div className="p-4">
                                        <h4 className="font-bold text-lg truncate">Estilo: {styleLabels[example.backgroundStyle]}</h4>
                                        <p className="text-sm text-gray-400">Guardado: {new Date(example.id).toLocaleDateString()}</p>
                                    </div>
                                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <button 
                                            onClick={() => handleDelete(example.id)}
                                            className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                 <div className="p-4 bg-gray-800/50 border-t border-gray-700 flex justify-end flex-shrink-0">
                    <button onClick={onClose} className="bg-amber-500 text-gray-900 font-bold py-2 px-6 rounded-lg hover:bg-amber-400 transition-all">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TrainingLibrary;