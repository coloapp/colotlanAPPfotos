// Fix: Implementing the FinalizationView component.
import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';
import Spinner from './Spinner';
import EditModal from './EditModal';
import VideoEditor from './VideoEditor';

interface FinalizationViewProps {
    selectedDesign: string;
    refinedLogo: string | null;
    onGenerateBatch: (mainImage: string) => void;
    batchImages: string[];
    isBatchLoading: boolean;
    onCreateVideoAd: (config: any) => void;
    videoUrl: string | null;
    isVideoLoading: boolean;
    loadingMessage: string;
    onDownload: (imageSrc: string) => void;
    onBack: () => void;
    // The onRefineImage prop is removed as refinement is now a separate, earlier step.
}

const FinalizationView: React.FC<FinalizationViewProps> = ({
    selectedDesign,
    refinedLogo,
    onGenerateBatch,
    batchImages,
    isBatchLoading,
    onCreateVideoAd,
    videoUrl,
    isVideoLoading,
    loadingMessage,
    onDownload,
    onBack,
}) => {
    const [currentImage, setCurrentImage] = useState(selectedDesign);
   
    useEffect(() => {
        setCurrentImage(selectedDesign);
    }, [selectedDesign]);

    const handleVideoDownload = () => {
        if (videoUrl) {
            const link = document.createElement('a');
            link.href = videoUrl;
            link.download = `anuncio_producto_ia.mp4`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };


    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-8 flex flex-col gap-8 animate-fade-in">
             <div className="flex justify-between items-center">
                <div className="text-center md:text-left">
                    <div className="inline-flex items-center gap-3 bg-white/50 px-4 py-2 rounded-full">
                        <div className="bg-sky-500 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold text-lg flex-shrink-0">6</div>
                        <h2 className="text-xl font-bold">Perfecciona y Exporta</h2>
                    </div>
                    <p className="text-slate-500 mt-2">Descarga tu diseño, genera más variaciones o crea un video comercial.</p>
                </div>
                <button onClick={onBack} className="bg-white hover:bg-slate-100 text-slate-600 font-semibold py-2 px-4 rounded-lg transition border border-slate-200 shadow-sm">
                    Volver a Diseños
                </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Main Image and Controls */}
                <div className="flex flex-col gap-4">
                    <div className="relative group rounded-lg overflow-hidden border-4 border-white shadow-lg aspect-square">
                        <img src={currentImage} alt="Diseño final" className="w-full h-full object-cover" />
                         {/* Refinement button is removed from this view */}
                    </div>
                     <button onClick={() => onDownload(currentImage)} className="w-full bg-sky-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-sky-500 transition-all flex items-center justify-center gap-2">
                        <Icon type="save" className="w-5 h-5"/>
                        <span>Descargar Imagen Principal</span>
                    </button>
                </div>

                {/* Batch Generation & Video */}
                <div className="flex flex-col gap-4">
                     <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                        <div className="flex flex-col items-center text-center mb-4">
                            <h3 className="text-xl font-bold mb-1">Lote de Venta</h3>
                            <p className="text-slate-500">Genera 4 acercamientos de tu producto para usar en carruseles y videos.</p>
                        </div>
                        {isBatchLoading ? (
                            <div className="flex items-center justify-center min-h-[200px]">
                                <Spinner message="Generando acercamientos..."/>
                            </div>
                        ) : batchImages.length > 0 ? (
                            <div className="grid grid-cols-2 gap-3">
                                {batchImages.map((img, index) => (
                                    <div key={index} className="rounded-md overflow-hidden border border-slate-200 aspect-square">
                                         <img src={img} alt={`Imagen de lote ${index + 1}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center min-h-[200px] bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 p-4">
                                <p className="text-slate-500 mb-4">Aún no has generado un lote.</p>
                                <button onClick={() => onGenerateBatch(currentImage)} className="bg-emerald-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-emerald-500 transition-all">
                                    Generar Lote Ahora
                                </button>
                            </div>
                        )}
                    </div>

                    <VideoEditor 
                        mainImage={currentImage}
                        batchImages={batchImages}
                        logoImage={refinedLogo}
                        videoUrl={videoUrl}
                        isVideoLoading={isVideoLoading}
                        loadingMessage={loadingMessage}
                        onCreateVideoAd={onCreateVideoAd}
                        onVideoDownload={handleVideoDownload}
                    />

                </div>
            </div>

            {/* EditModal is no longer needed here */}
        </div>
    );
};

export default FinalizationView;