import React from 'react';
import { Icon } from './Icon';
// Fix: Corrected import path for types.
import type { ImageFile } from './../types';

interface ImageInputProps {
  id: string;
  label: string;
  image: ImageFile | null;
  onImageChange: (file: File) => void;
  icon: 'product' | 'logo';
  step: number | string;
}

const ImageInput: React.FC<ImageInputProps> = ({ id, label, image, onImageChange, icon, step }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onImageChange && e.target.files && e.target.files[0]) {
      onImageChange(e.target.files[0]);
    }
  };

  return (
    <div className={`bg-white border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center transition-all duration-300 w-full aspect-square relative hover:border-sky-400 hover:bg-slate-50 shadow-sm`}>
      <div className="absolute top-4 left-4 bg-sky-500 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold text-lg z-10">{step}</div>
      <label htmlFor={id} className={`cursor-pointer w-full h-full flex flex-col items-center justify-center text-center relative`}>
        {image ? (
          <>
            <img src={image.base64} alt={label} className="w-full h-full object-contain rounded-lg" />
            <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg">
                <div className="flex items-center gap-2 text-emerald-400">
                    <Icon type="check" className="w-8 h-8"/>
                    <span className="font-semibold text-lg">Cargado</span>
                </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 text-slate-500">
            <Icon type={icon} className="w-16 h-16"/>
            <span className="font-semibold text-lg">{label}</span>
            <span className="text-sm text-slate-400">Haz clic o arrastra para seleccionar</span>
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