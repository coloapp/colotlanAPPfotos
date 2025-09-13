import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Icon } from './Icon';

// Fix: Renamed interface to match component and filename
interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  productImage: string; // The base64 string with data URI
  onRefine: (maskBase64: string) => void;
}

// Fix: Renamed component to match filename for consistency
const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, productImage, onRefine }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(40);

  // Using a solid, unique color for drawing to make mask creation easier
  const drawingColor = 'rgba(255, 0, 255, 1)'; // Solid Magenta

  const drawImageOnCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const img = new Image();
    img.src = productImage;
    img.onload = () => {
      // Set canvas dimensions to the image's natural dimensions for 1:1 pixel mapping
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
    };
    img.onerror = () => {
        console.error("Failed to load image for canvas.");
    }
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
      if (window.TouchEvent && e.nativeEvent instanceof TouchEvent) {
          const touch = e.nativeEvent.touches[0];
          clientX = touch.clientX;
          clientY = touch.clientY;
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
    const maskData = new Uint8ClampedArray(data.length);

    // This is the color we draw with: R=255, G=0, B=255
    const [r, g, b] = [255, 0, 255];

    // Iterate through each pixel to create a pure mask
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] === r && data[i + 1] === g && data[i + 2] === b) {
        // If the pixel matches our drawing color, make it black on the mask
        maskData[i] = 0;       // R
        maskData[i + 1] = 0;   // G
        maskData[i + 2] = 0;   // B
        maskData[i + 3] = 255; // Alpha (fully opaque)
      } else {
        // Otherwise, make it fully transparent
        maskData[i + 3] = 0;
      }
    }

    // Create a new canvas to hold the pure mask
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    const maskCtx = maskCanvas.getContext('2d');
    
    if (!maskCtx) return;
    
    maskCtx.putImageData(new ImageData(maskData, canvas.width, canvas.height), 0, 0);

    const maskBase64 = maskCanvas.toDataURL('image/png').split(',')[1];
    onRefine(maskBase64);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in-scale">
      <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl z-10 relative border border-gray-700 flex flex-col overflow-hidden max-h-[90vh]">
        <div className="p-4 flex justify-between items-center border-b border-gray-700 flex-shrink-0">
            <h2 className="text-xl font-bold text-white">Refinar Imagen</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700">
                <Icon type="close" className="w-6 h-6" />
            </button>
        </div>

        <div className="p-4 flex-grow overflow-auto flex flex-col lg:flex-row gap-4">
             <div className="lg:w-2/3 flex items-center justify-center bg-dots-pattern rounded-lg overflow-hidden">
                <canvas 
                    ref={canvasRef} 
                    className="cursor-crosshair max-w-full max-h-full object-contain"
                    style={{ touchAction: 'none' }} // Prevent scrolling on touch devices while drawing
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
             </div>
             <div className="lg:w-1/3 bg-gray-800/50 p-4 rounded-lg flex flex-col gap-4">
                <h3 className="text-lg font-semibold">Herramienta de Pincel</h3>
                <p className="text-sm text-gray-400">Pinta sobre las áreas de la imagen que quieres eliminar. La IA borrará todo lo que marques.</p>
                <div>
                    <label htmlFor="brushSize" className="block mb-2 text-sm font-medium text-gray-300">Tamaño del Pincel: {brushSize}px</label>
                    <input 
                        id="brushSize" 
                        type="range" 
                        min="5" 
                        max="100" 
                        value={brushSize}
                        onChange={(e) => setBrushSize(Number(e.target.value))}
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                </div>
                <button onClick={drawImageOnCanvas} className="w-full text-center bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg transition">
                    Limpiar Dibujo
                </button>
             </div>
        </div>

        <div className="p-4 bg-gray-800/50 border-t border-gray-700 flex justify-end flex-shrink-0">
            <button onClick={handleApplyRefinement} className="flex items-center gap-2 bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-500 transition-all">
                <Icon type="wand" className="w-5 h-5"/>
                <span>Aplicar Refinamiento</span>
            </button>
        </div>
      </div>
    </div>
  );
};

// Fix: Renamed component export to match filename
export default EditModal;
