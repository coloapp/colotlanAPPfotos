import React from 'react';
import { Icon } from './Icon';
import type { FinalImage } from './../types';

interface ImageLibraryModalProps {
    isOpen: boolean;
    onClose: () => void;
    images: FinalImage[];
}

const ImageLibraryModal: React.FC<ImageLibraryModalProps> = ({ isOpen, onClose, images }) => {
    if (!isOpen) return null;
    
    const handleDownload = (src: string, id: string) => {
        const link = document.createElement('a');
        link.href = src;
        link.download = `producto_ai_${id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in-scale">
            <div className="bg-gray-900 rounded-2xl w-full max-w-4xl relative border border-gray-700 flex flex-col max-h-[90vh]">
                 <header className="p-4 flex justify-between items-center border-b border-gray-700 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <Icon type="gallery" className="w-6 h-6 text-amber-400"/>
                        <h2 className="text-xl font-bold text-white">Biblioteca de Imágenes</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700">
                        <Icon type="close" className="w-6 h-6" />
                    </button>
                </header>
                <main className="p-6 overflow-y-auto">
                    {images.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {images.map((image) => (
                                <div key={image.id} className="relative group rounded-lg overflow-hidden border border-gray-700">
                                    <img src={image.src} alt={`Imagen generada el ${image.createdAt.toLocaleString()}`} className="w-full h-full object-cover aspect-square"/>
                                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-2 text-center">
                                        <p className="text-xs text-gray-300 mb-2">{image.createdAt.toLocaleDateString()}</p>
                                        <button onClick={() => handleDownload(image.src, image.id)} className="bg-amber-600 text-white font-semibold py-2 px-3 text-sm rounded-md hover:bg-amber-500">
                                            Descargar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <p className="text-gray-400">Tu biblioteca está vacía.</p>
                            <p className="text-gray-500 text-sm">Las imágenes que descargues aparecerán aquí.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ImageLibraryModal;
