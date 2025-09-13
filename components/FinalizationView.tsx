import React, { useState, useRef, useCallback } from 'react';
import { Icon } from './Icon';

type AspectRatio = '1:1' | '9:16' | '16:9';

interface FinalizationViewProps {
  selectedDesign: string;
  onDownload: (finalImageSrc: string) => void;
}

const aspectRatios: { id: AspectRatio, name: string, icon: 'square' | 'aspect-ratio-tall' | 'aspect-ratio-wide', value: number }[] = [
    { id: '1:1', name: 'Cuadrado', icon: 'square', value: 1/1 },
    { id: '9:16', name: 'Historia', icon: 'aspect-ratio-tall', value: 9/16 },
    { id: '16:9', name: 'Ancho', icon: 'aspect-ratio-wide', value: 16/9 },
];

const FinalizationView: React.FC<FinalizationViewProps> = ({ selectedDesign, onDownload }) => {
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    const previewRef = useRef<HTMLDivElement>(null);

    const getAspectRatioClass = (ratio: AspectRatio) => {
        if (ratio === '1:1') return 'aspect-square';
        if (ratio === '9:16') return 'aspect-[9/16]';
        if (ratio === '16:9') return 'aspect-[16/9]';
        return '';
    };

    const handleDownload = useCallback(() => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = selectedDesign;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            
            const currentRatio = aspectRatios.find(r => r.id === aspectRatio)?.value ?? 1;
            const outputWidth = 1080; // Standard width
            const outputHeight = outputWidth / currentRatio;

            canvas.width = outputWidth;
            canvas.height = outputHeight;

            // Center-crop logic
            const imgRatio = img.naturalWidth / img.naturalHeight;
            let srcX = 0, srcY = 0, srcWidth = img.naturalWidth, srcHeight = img.naturalHeight;

            if (currentRatio > imgRatio) { // Output is wider than image -> crop top/bottom
                srcHeight = img.naturalWidth / currentRatio;
                srcY = (img.naturalHeight - srcHeight) / 2;
            } else { // Output is taller than image -> crop left/right
                srcWidth = img.naturalHeight * currentRatio;
                srcX = (img.naturalWidth - srcWidth) / 2;
            }

            ctx.drawImage(img, srcX, srcY, srcWidth, srcHeight, 0, 0, outputWidth, outputHeight);
            
            const finalImageSrc = canvas.toDataURL('image/png');
            onDownload(finalImageSrc);

            const link = document.createElement('a');
            link.href = finalImageSrc;
            link.download = `producto_final_${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };
    }, [selectedDesign, aspectRatio, onDownload]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex items-center justify-center">
                <div ref={previewRef} className={`w-full max-w-2xl mx-auto rounded-lg overflow-hidden transition-all duration-300 ${getAspectRatioClass(aspectRatio)}`}>
                    <img src={selectedDesign} alt="Diseño final" className="w-full h-full object-cover"/>
                </div>
            </div>
            <aside className="lg:col-span-1 bg-gray-800/50 p-6 rounded-lg flex flex-col gap-6">
                <div>
                    <h3 className="text-lg font-semibold mb-3">4. Formato Final</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {aspectRatios.map(({ id, name, icon }) => (
                            <button key={id} onClick={() => setAspectRatio(id)} className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition ${aspectRatio === id ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'border-gray-700 hover:bg-gray-700'}`}>
                                <Icon type={icon} className="w-6 h-6"/>
                                <span className="text-xs font-medium">{name}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <button onClick={handleDownload} className="w-full mt-auto bg-amber-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-amber-500 transition-all flex items-center justify-center gap-2">
                    <Icon type="save" className="w-5 h-5"/>
                    <span>Descargar y Guardar</span>
                </button>
            </aside>
        </div>
    );
};

export default FinalizationView;
