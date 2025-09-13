import React from 'react';
import { Icon } from './Icon';
import type { ImageFile } from '../types';

interface ImageInputProps {
  id: string;
  label: string;
  image: ImageFile | null;
  onImageChange: (file: File) => void;
  icon: 'product' | 'logo';
  step: number;
}

const ImageInput: React.FC<ImageInputProps> = ({ id, label, image, onImageChange, icon, step }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageChange(e.target.files[0]);
    }
  };

  return (
    <div className="bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-2xl p-6 flex flex-col items-center justify-center transition-all duration-300 hover:border-amber-400 hover:bg-gray-800 w-full aspect-square relative">
        <div className="absolute top-4 left-4 bg-amber-500 text-gray-900 rounded-full h-8 w-8 flex items-center justify-center font-bold text-lg z-10">{step}</div>
      <label htmlFor={id} className="cursor-pointer w-full h-full flex flex-col items-center justify-center text-center relative">
        {image ? (
          <>
            <img src={image.base64} alt={label} className="w-full h-full object-contain rounded-lg" />
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg">
                <div className="flex items-center gap-2 text-green-400">
                    <Icon type="check" className="w-8 h-8"/>
                    <span className="font-semibold text-lg">Cargado</span>
                </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 text-gray-400">
            {icon === 'product' && <Icon type="product" className="w-16 h-16"/>}
            {icon === 'logo' && <Icon type="logo" className="w-16 h-16"/>}
            <span className="font-semibold text-lg">{label}</span>
            <span className="text-sm text-gray-500">Haz clic para seleccionar</span>
          </div>
        )}
      </label>
      <input
        type="file"
        id={id}
        name={id}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ImageInput;
