import React, { useState } from 'react';
import ImageInput from './components/ImageInput';
import EditModal from './components/EditModal';
import Spinner from './components/Spinner';
import DesignGrid from './components/DesignGrid';
import FinalizationView from './components/FinalizationView';
import ImageLibraryModal from './components/ImageLibraryModal';
import { refineImage, generateStudioScenes } from './services/geminiService';
import type { ImageFile, FinalImage, AppStage } from './types';
import { Icon } from './components/Icon';

const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});

const App: React.FC = () => {
  const [stage, setStage] = useState<AppStage>('PRODUCT');
  
  const [productImage, setProductImage] = useState<ImageFile | null>(null);
  const [refinedProduct, setRefinedProduct] = useState<string | null>(null);
  const [logoImage, setLogoImage] = useState<ImageFile | null>(null);
  const [refinedLogo, setRefinedLogo] = useState<string | null>(null);

  const [designProposals, setDesignProposals] = useState<string[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<{ type: 'product' | 'logo', base64: string } | null>(null);
  
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [savedImages, setSavedImages] = useState<FinalImage[]>([]);

  const handleReset = () => {
      setStage('PRODUCT');
      setProductImage(null);
      setRefinedProduct(null);
      setLogoImage(null);
      setRefinedLogo(null);
      setDesignProposals([]);
      setSelectedDesign(null);
      setError(null);
  }

  const handleImageUpload = async (file: File, type: 'product' | 'logo') => {
    const base64 = await toBase64(file);
    if (type === 'product') {
      setProductImage({ file, base64 });
      setRefinedProduct(base64); // Initially set refined to original
    } else {
      setLogoImage({ file, base64 });
      setRefinedLogo(base64);
    }
  };

  const handleOpenEditModal = (type: 'product' | 'logo') => {
    const imageToEdit = type === 'product' ? refinedProduct : refinedLogo;
    if (imageToEdit) {
      setEditingImage({ type, base64: imageToEdit });
      setIsEditModalOpen(true);
    }
  };

  const handleRefine = async (maskBase64: string) => {
    if (!editingImage) return;
    
    setIsEditModalOpen(false);
    setIsLoading(true);
    setLoadingMessage(`Refinando ${editingImage.type === 'product' ? 'producto' : 'logotipo'}...`);
    setError(null);
    
    try {
      const result = await refineImage(editingImage.base64, maskBase64);
      if (editingImage.type === 'product') {
        setRefinedProduct(result);
      } else {
        setRefinedLogo(result);
      }
    } catch (err) {
      setError('Falló el refinamiento de la imagen. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
      setEditingImage(null);
    }
  };

  const handleProductNext = () => {
    if (refinedProduct) setStage('LOGO');
  };

  const handleLogoNext = async () => {
    if (!refinedProduct || !refinedLogo) return;

    setStage('DESIGN');
    setIsLoading(true);
    setLoadingMessage('Generando diseños de estudio profesionales...');
    setError(null);

    try {
        const results = await generateStudioScenes(refinedProduct, refinedLogo);
        setDesignProposals(results);
    } catch (err) {
        setError('No se pudieron generar los diseños. Por favor, inténtalo de nuevo.');
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleDesignSelect = (design: string) => {
    setSelectedDesign(design);
    setStage('FINALIZE');
  }

  const handleSaveToLibrary = (finalImageSrc: string) => {
    const newImage: FinalImage = {
      id: crypto.randomUUID(),
      src: finalImageSrc,
      createdAt: new Date(),
    };
    setSavedImages(prev => [newImage, ...prev]);
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex items-center justify-center min-h-[60vh]"><Spinner message={loadingMessage} /></div>;
    }
    if (error) {
      return (
        <div className="text-center min-h-[60vh] flex flex-col items-center justify-center">
            <p className="text-red-600 font-medium">{error}</p>
            <button onClick={handleReset} className="mt-4 bg-sky-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-500">Empezar de Nuevo</button>
        </div>
      );
    }

    switch (stage) {
      case 'PRODUCT':
        return (
          <div className="max-w-md mx-auto flex flex-col gap-4 items-center">
            <ImageInput id="product-image" label="1. Subir Producto" image={productImage} onImageChange={(file) => handleImageUpload(file, 'product')} icon="product" step="1"/>
            {refinedProduct && (
              <>
                <div className="w-full rounded-lg border border-slate-200 bg-white shadow-sm p-2">
                    <img src={refinedProduct} alt="Producto refinado" className="w-full rounded-md" />
                </div>
                <button onClick={() => handleOpenEditModal('product')} className="w-full text-center bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3 px-4 rounded-lg transition border border-slate-300">Refinar Fondo</button>
                <button onClick={handleProductNext} className="w-full bg-sky-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-sky-500 transition-all">Guardar y Continuar</button>
              </>
            )}
          </div>
        );
      case 'LOGO':
          return (
            <div className="max-w-md mx-auto flex flex-col gap-4 items-center">
              <ImageInput id="logo-image" label="2. Subir Logotipo" image={logoImage} onImageChange={(file) => handleImageUpload(file, 'logo')} icon="logo" step="2"/>
              {refinedLogo && (
                <>
                  <div className="w-full rounded-lg border border-slate-200 bg-white shadow-sm p-4">
                    <img src={refinedLogo} alt="Logotipo refinado" className="w-full rounded-md" />
                  </div>
                  <button onClick={() => handleOpenEditModal('logo')} className="w-full text-center bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3 px-4 rounded-lg transition border border-slate-300">Refinar Fondo</button>
                  <button onClick={handleLogoNext} className="w-full bg-sky-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-sky-500 transition-all">Generar Diseños</button>
                </>
              )}
            </div>
          );
      case 'DESIGN':
        return <DesignGrid designs={designProposals} onSelect={handleDesignSelect} />;
      case 'FINALIZE':
        return selectedDesign ? <FinalizationView selectedDesign={selectedDesign} onDownload={handleSaveToLibrary} /> : null;
      default:
        return <div>Etapa desconocida</div>;
    }
  };

  return (
    <div className="min-h-screen font-sans">
      <header className="bg-white/80 p-4 border-b border-slate-200 sticky top-0 z-20 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Icon type="wand" className="w-8 h-8 text-sky-500"/>
                <h1 className="text-2xl font-bold text-slate-900">Estudio de Producto AI</h1>
            </div>
            <div className="flex items-center gap-4">
                <button onClick={() => setIsLibraryOpen(true)} className="text-slate-500 hover:text-sky-500 transition p-2 hover:bg-slate-100 rounded-full" title="Biblioteca de Imágenes">
                    <Icon type="gallery" className="w-6 h-6" />
                </button>
                 <button onClick={handleReset} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2 px-4 rounded-lg transition">
                    Empezar de Nuevo
                </button>
            </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        {renderContent()}
      </main>

      {isEditModalOpen && editingImage && (
        <EditModal 
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          productImage={editingImage.base64}
          onRefine={handleRefine}
        />
      )}
      
      <ImageLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        images={savedImages}
      />
    </div>
  );
}

export default App;