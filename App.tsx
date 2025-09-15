import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { AppStage, ImageFile, FinalImage } from './types';
import * as geminiService from './services/geminiService';

import ImageInput from './components/ImageInput';
import Spinner from './components/Spinner';
import DesignGrid from './components/DesignGrid';
import FinalizationView from './components/FinalizationView';
import ImageLibraryModal from './components/ImageLibraryModal';
import { Icon } from './components/Icon';
import RefinementView from './components/RefinementView';


const App: React.FC = () => {
  const [appStage, setAppStage] = useState<AppStage>('UPLOAD_PRODUCT');
  
  // Original uploaded images
  const [productImage, setProductImage] = useState<ImageFile | null>(null);
  const [logoImage, setLogoImage] = useState<ImageFile | null>(null);

  // AI-processed, transparent PNGs
  const [refinedProduct, setRefinedProduct] = useState<string | null>(null);
  const [refinedLogo, setRefinedLogo] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [designs, setDesigns] = useState<string[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<string | null>(null);
  const [batchImages, setBatchImages] = useState<string[]>([]);
  const [isBatchLoading, setIsBatchLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [imageLibrary, setImageLibrary] = useState<FinalImage[]>([]);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
    });

  const handleProductUpload = async (file: File) => {
    try {
      setIsLoading(true);
      setLoadingMessage('Eliminando el fondo del producto...');
      setError(null);
      const base64 = await toBase64(file);
      setProductImage({ file, base64 });
      const processedImage = await geminiService.removeBackground(base64);
      setRefinedProduct(processedImage);
      setAppStage('REFINE_PRODUCT');
    } catch (err: any) {
      console.error("Error processing product image:", err);
      setError(err.message || 'No se pudo procesar la imagen del producto.');
      setAppStage('UPLOAD_PRODUCT'); // Revert stage on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = async (file: File) => {
    try {
      setIsLoading(true);
      setLoadingMessage('Eliminando el fondo del logo...');
      setError(null);
      const base64 = await toBase64(file);
      setLogoImage({ file, base64 });
      const processedImage = await geminiService.removeBackground(base64);
      setRefinedLogo(processedImage);
      setAppStage('REFINE_LOGO');
    } catch (err: any) {
      console.error("Error processing logo image:", err);
      setError(err.message || 'No se pudo procesar la imagen del logo.');
      setAppStage('UPLOAD_LOGO'); // Revert stage on error
    } finally {
      setIsLoading(false);
    }
  };


  const handleGenerateDesigns = async () => {
    if (!refinedProduct || !refinedLogo) {
      setError("Faltan el producto y el logo refinados.");
      return;
    }
    setIsLoading(true);
    setLoadingMessage('Tu director de arte IA está trabajando... Esto puede tardar hasta un minuto.');
    setError(null);
    try {
      const generatedDesigns = await geminiService.generateInitialDesigns(refinedProduct, refinedLogo);
      setDesigns(generatedDesigns);
      setAppStage('SELECT_DESIGN');
    } catch (err: any) {
      console.error("Error generating designs:", err);
      setError(err.message || "Ocurrió un error al generar los diseños. Por favor, inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSelectDesign = (design: string) => {
    setSelectedDesign(design);
    setAppStage('FINALIZE');
  };

  const handleRefineWithMask = async (imageToRefine: string, mask: string, type: 'product' | 'logo') => {
      setIsLoading(true);
      setLoadingMessage('Aplicando retoques mágicos...');
      setError(null);
      try {
          const refinedImage = await geminiService.refineBackground(imageToRefine, mask);
          if (type === 'product') {
            setRefinedProduct(refinedImage);
          } else {
            setRefinedLogo(refinedImage);
          }
      } catch (err: any) {
          console.error("Error refining image:", err);
          setError(err.message || "No se pudo refinar la imagen.");
      } finally {
          setIsLoading(false);
      }
  };
  
  const handleGenerateBatch = async (mainImage: string) => {
    setIsBatchLoading(true);
    setError(null);
    try {
        const batch = await geminiService.generateBatchImages(mainImage);
        setBatchImages(batch);
    } catch (err: any) {
        console.error("Error generating batch images:", err);
        setError(err.message || "No se pudieron generar las imágenes de lote.");
    } finally {
        setIsBatchLoading(false);
    }
  };

  const handleCreateVideoAd = async (config: { headline: string; socials: any }) => {
    if (!selectedDesign || !refinedLogo) return;
    setIsVideoLoading(true);
    setLoadingMessage("Creando tu comercial... Esto puede tomar varios minutos.");
    setError(null);
    try {
        const url = await geminiService.createVideoAd(selectedDesign, batchImages, refinedLogo, config.headline, config.socials);
        setVideoUrl(url);
    } catch(err: any) {
        console.error("Error creating video ad:", err);
        setError(err.message || "No se pudo crear el video.");
    } finally {
        setIsVideoLoading(false);
    }
  };

  const handleDownloadAndStore = (imageSrc: string) => {
    const newImage: FinalImage = {
        id: uuidv4(),
        src: imageSrc,
        createdAt: new Date(),
    };
    setImageLibrary(prev => [newImage, ...prev]);

    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = `producto_ai_${newImage.id.substring(0,6)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderContent = () => {
    if (isLoading) {
      return <Spinner message={loadingMessage} />;
    }
    
    switch (appStage) {
      case 'UPLOAD_PRODUCT':
        return (
          <div className="flex flex-col gap-6 items-center w-full max-w-md mx-auto">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight">Paso 1: Sube tu Producto</h2>
                <p className="text-slate-500 mt-2">La IA eliminará el fondo automáticamente.</p>
            </div>
            <ImageInput id="product-image" label="Seleccionar Producto" image={null} onImageChange={handleProductUpload} icon="product" step={1} />
          </div>
        );

      case 'REFINE_PRODUCT':
        return (
            <RefinementView 
              title="Paso 2: Refina tu Producto"
              description="Aprueba el recorte de la IA o usa el pincel para perfeccionarlo."
              originalImage={productImage?.base64 || ''}
              refinedImage={refinedProduct || ''}
              onRefine={(mask) => handleRefineWithMask(productImage!.base64, mask, 'product')}
              onConfirm={() => setAppStage('UPLOAD_LOGO')}
            />
        );
      
      case 'UPLOAD_LOGO':
        return (
          <div className="flex flex-col gap-6 items-center w-full max-w-md mx-auto">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight">Paso 3: Sube tu Logo</h2>
                <p className="text-slate-500 mt-2">El fondo también será eliminado.</p>
            </div>
            <ImageInput id="logo-image" label="Seleccionar Logo" image={null} onImageChange={handleLogoUpload} icon="logo" step={3}/>
          </div>
        );

      case 'REFINE_LOGO':
        return (
            <RefinementView 
              title="Paso 4: Refina tu Logo"
              description="Asegúrate de que el recorte de tu logo sea perfecto."
              originalImage={logoImage?.base64 || ''}
              refinedImage={refinedLogo || ''}
              onRefine={(mask) => handleRefineWithMask(logoImage!.base64, mask, 'logo')}
              onConfirm={handleGenerateDesigns}
            />
        );

      case 'SELECT_DESIGN':
        return <DesignGrid designs={designs} onSelect={handleSelectDesign} />;
      
      case 'FINALIZE':
        return (
          // Fix: Removed unsupported `onRefineImage` prop from `FinalizationView`.
          // Image refinement is now handled in the `REFINE_PRODUCT` and `REFINE_LOGO` stages.
          <FinalizationView 
              selectedDesign={selectedDesign!} 
              refinedLogo={refinedLogo}
              onGenerateBatch={handleGenerateBatch}
              batchImages={batchImages}
              isBatchLoading={isBatchLoading}
              onCreateVideoAd={handleCreateVideoAd}
              videoUrl={videoUrl}
              isVideoLoading={isVideoLoading}
              loadingMessage={loadingMessage}
              onDownload={handleDownloadAndStore}
              onBack={() => {
                  setSelectedDesign(null);
                  setBatchImages([]);
                  setVideoUrl(null);
                  setAppStage('SELECT_DESIGN');
              }}
          />
        );
      
      default:
        return <div>Etapa desconocida</div>;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800">
      <header className="p-4 border-b border-slate-200 bg-white/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
                <Icon type="wand" className="w-8 h-8 text-sky-500"/>
                <h1 className="text-2xl font-bold text-slate-900">Estudio de Producto IA</h1>
            </div>
            <button onClick={() => setIsLibraryOpen(true)} className="flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-600 font-semibold py-2 px-4 rounded-lg transition border border-slate-200 shadow-sm">
                <Icon type="gallery" className="w-5 h-5"/>
                <span>Biblioteca</span>
            </button>
        </div>
      </header>

      <main className="p-4 md:p-8 flex items-center justify-center min-h-[calc(100vh-81px)]">
          <div className="w-full">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative max-w-4xl mx-auto mb-6" role="alert">
                    <strong className="font-bold">¡Oh no! </strong>
                    <span className="block sm:inline">{error}</span>
                    <button className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
                        <Icon type="close" className="w-6 h-6 text-red-500"/>
                    </button>
                </div>
            )}
            {renderContent()}
          </div>
      </main>
      
      <ImageLibraryModal 
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        images={imageLibrary}
      />
    </div>
  );
};

export default App;
