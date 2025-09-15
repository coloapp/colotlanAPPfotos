import React, { useState } from 'react';
import { Icon } from './Icon';
import EditModal from './EditModal';

interface RefinementViewProps {
    title: string;
    description: string;
    originalImage: string;
    refinedImage: string;
    onRefine: (mask: string) => Promise<void>;
    onConfirm: () => void;
}

const RefinementView: React.FC<RefinementViewProps> = ({
    title,
    description,
    originalImage,
    refinedImage,
    onRefine,
    onConfirm,
}) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleRefine = async (maskBase64: string) => {
        try {
            await onRefine(maskBase64);
            setIsEditModalOpen(false);
        } catch (error) {
            console.error("Failed to refine image:", error);
            // Optionally show an error to the user
        }
    };
    
    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6 animate-fade-in">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
                <p className="text-slate-500 mt-2">{description}</p>
            </div>

            <div className="w-full bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="text-center">
                         <h3 className="font-semibold text-slate-600 mb-2">Original</h3>
                         <div className="rounded-lg overflow-hidden border border-slate-200">
                            <img src={originalImage} alt="Original" className="w-full object-contain aspect-square"/>
                         </div>
                    </div>
                     <div className="text-center">
                        <h3 className="font-semibold text-slate-600 mb-2">Resultado (Fondo Eliminado)</h3>
                        <div 
                            className="rounded-lg overflow-hidden border border-slate-200 aspect-square"
                            style={{
                                backgroundImage: `
                                    linear-gradient(45deg, #ccc 25%, transparent 25%), 
                                    linear-gradient(-45deg, #ccc 25%, transparent 25%),
                                    linear-gradient(45deg, transparent 75%, #ccc 75%),
                                    linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
                                backgroundSize: `20px 20px`,
                                backgroundPosition: `0 0, 0 10px, 10px -10px, -10px 0px`
                            }}
                        >
                             <img src={refinedImage} alt="Refined" className="w-full object-contain aspect-square"/>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                 <button onClick={() => setIsEditModalOpen(true)} className="w-full sm:w-auto bg-white hover:bg-slate-100 text-slate-700 font-bold py-3 px-6 rounded-lg transition border border-slate-300 shadow-sm flex items-center justify-center gap-2">
                    <Icon type="wand" className="w-5 h-5 text-sky-500"/>
                    <span>Refinar Manualmente</span>
                </button>
                <button onClick={onConfirm} className="w-full sm:w-auto bg-sky-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-sky-500 transition-all shadow-lg flex items-center justify-center gap-2">
                    <span>Confirmar y Continuar</span>
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                </button>
            </div>
            
            <EditModal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                productImage={originalImage} // Always edit from the original
                onRefine={handleRefine}
            />
        </div>
    );
};

export default RefinementView;
