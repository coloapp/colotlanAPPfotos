import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Icon } from './Icon';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  productImage: string; 
  onRefine: (maskBase64: string) => void;
}

const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, productImage, onRefine }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(40);

  const drawingColor = 'rgba(255, 0, 255, 1)'; // Solid Magenta for the mask

  const drawImageOnCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const img = new Image();
    img.src = productImage;
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
    };
    img.onerror = () => console.error("Failed to load image for canvas.");
  }, [productImage]);
  
  useEffect(() => {
    if (isOpen) {
      drawImageOnCanvas();
    }
  }, [isOpen, drawImageOnCanvas]);

  const getCoords = (e: React.MouseEvent | React.TouchEvent): {x: number, y: number} => {
      const canvas = canvasRef.current;
      if (!canvas) return {x: 0, y: 0};
      
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      let clientX, clientY;
      if ('touches' in e.nativeEvent) {
          clientX = e.nativeEvent.touches[0].clientX;
          clientY = e.nativeEvent.touches[0].clientY;
      } else {
          const mouseEvent = e as React.MouseEvent;
          clientX = mouseEvent.clientX;
          clientY = mouseEvent.clientY;
      }
      
      return {
          x: (clientX - rect.left) * scaleX,
          y: (clientY - rect.top) * scaleY,
      };
  }

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const { x, y } = getCoords(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCoords(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.strokeStyle = drawingColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.closePath();
    setIsDrawing(false);
  };
  
  const handleApplyRefinement = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) return;

    const newImageData = maskCtx.createImageData(canvas.width, canvas.height);
    const maskData = newImageData.data;

    const [r, g, b] = [255, 0, 255]; // Magenta

    for (let i = 0; i < data.length; i += 4) {
      if (data[i] === r && data[i + 1] === g && data[i + 2] === b) {
        maskData[i] = 0;   
        maskData[i + 1] = 0;
        maskData[i + 2] = 0;
        maskData[i + 3] = 255; // Black pixel on mask
      } else {
        maskData[i + 3] = 0; // Transparent elsewhere
      }
    }

    maskCtx.putImageData(newImageData, 0, 0);
    const maskBase64 = maskCanvas.toDataURL('image/png').split(',')[1];
    onRefine(maskBase64);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in-scale">
      <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl z-10 relative border border-gray-700 flex flex-col overflow-hidden max-h-[90vh]">
        <header className="p-4 flex justify-between items-center border-b border-gray-700 flex-shrink-0">
            <h2 className="text-xl font-bold text-white">Refinar Fondo</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700">
                <Icon type="close" className="w-6 h-6" />
            </button>
        </header>

        <main className="p-4 flex-grow overflow-auto flex flex-col lg:flex-row gap-4">
             <div className="lg:w-2/3 flex items-center justify-center bg-gray-800 rounded-lg overflow-hidden">
                <canvas 
                    ref={canvasRef} 
                    className="cursor-crosshair max-w-full max-h-full object-contain"
                    style={{ touchAction: 'none' }}
                    onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
                />
             </div>
             <aside className="lg:w-1/3 bg-gray-800/50 p-4 rounded-lg flex flex-col gap-4">
                <h3 className="text-lg font-semibold">Herramienta de Pincel</h3>
                <p className="text-sm text-gray-400">Pinta sobre las áreas que quieres eliminar. La IA borrará todo lo que marques.</p>
                <div>
                    <label htmlFor="brushSize" className="block mb-2 text-sm font-medium text-gray-300">Tamaño del Pincel: {brushSize}px</label>
                    <input id="brushSize" type="range" min="5" max="100" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                </div>
                <button onClick={drawImageOnCanvas} className="w-full text-center bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg transition">Limpiar Dibujo</button>
             </aside>
        </main>

        <footer className="p-4 bg-gray-800/50 border-t border-gray-700 flex justify-end flex-shrink-0">
            <button onClick={handleApplyRefinement} className="flex items-center gap-2 bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-500 transition-all">
                <Icon type="wand" className="w-5 h-5"/>
                <span>Aplicar Refinamiento</span>
            </button>
        </footer>
      </div>
    </div>
  );
};

export default EditModal;
