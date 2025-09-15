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
        <div className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-4 animate-fade-in-scale">
            <div className="bg-white rounded-2xl w-full max-w-4xl relative border border-slate-200 flex flex-col max-h-[90vh] shadow-2xl">
                 <header className="p-4 flex justify-between items-center border-b border-slate-200 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <Icon type="gallery" className="w-6 h-6 text-sky-500"/>
                        <h2 className="text-xl font-bold text-slate-900">Biblioteca de Imágenes</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-800 transition-colors p-2 rounded-full hover:bg-slate-100">
                        <Icon type="close" className="w-6 h-6" />
                    </button>
                </header>
                <main className="p-6 overflow-y-auto bg-slate-50/50">
                    {images.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {images.map((image) => (
                                <div key={image.id} className="relative group rounded-lg overflow-hidden border border-slate-200 bg-white shadow-sm">
                                    <img src={image.src} alt={`Imagen generada el ${image.createdAt.toLocaleString()}`} className="w-full h-full object-cover aspect-square"/>
                                    <div className="absolute inset-0 bg-slate-900/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-2 text-center">
                                        <p className="text-xs text-slate-300 mb-2">{image.createdAt.toLocaleDateString()}</p>
                                        <button onClick={() => handleDownload(image.src, image.id)} className="bg-sky-600 text-white font-semibold py-2 px-3 text-sm rounded-md hover:bg-sky-500">
                                            Descargar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <p className="text-slate-500">Tu biblioteca está vacía.</p>
                            <p className="text-slate-400 text-sm">Las imágenes que descargues aparecerán aquí.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ImageLibraryModal;