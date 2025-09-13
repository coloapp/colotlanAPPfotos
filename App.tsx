import React, { useState, useCallback } from 'react';
import ImageInput from './components/ImageInput';
import BackgroundSelector from './components/BackgroundSelector';
import Spinner from './components/Spinner';
import EditModal from './components/EditModal';
import { Icon } from './components/Icon';
import type { ImageFile } from './types';
import { generateBackground, combineProductWithBackground, refineImage, BackgroundStyle } from './services/geminiService';

enum AppState {
  UPLOADING,
  GENERATING_BACKGROUNDS,
  SELECTING_BACKGROUND,
  COMBINING_IMAGES,
  DISPLAYING_RESULT,
  REFINING_IMAGE,
}

function App() {
  const [productImage, setProductImage] = useState<ImageFile | null>(null);
  const [logoImage, setLogoImage] = useState<ImageFile | null>(null);
  const [backgrounds, setBackgrounds] = useState<string[]>([]);
  const [finalImage, setFinalImage] = useState<string | null>(null);
  const [appState, setAppState] = useState<AppState>(AppState.UPLOADING);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleProductImageChange = async (file: File) => {
    try {
      const base64 = await fileToBase64(file);
      setProductImage({ file, base64 });
    } catch (err) {
      setError('Error processing product image.');
    }
  };

  const handleLogoImageChange = async (file: File) => {
    try {
      const base64 = await fileToBase64(file);
      setLogoImage({ file, base64 });
    } catch (err) {
      setError('Error processing logo image.');
    }
  };

  const handleGenerateBackgrounds = useCallback(async () => {
    if (!logoImage) return;
    setAppState(AppState.GENERATING_BACKGROUNDS);
    setError(null);
    try {
      const styles: BackgroundStyle[] = ['watermark', 'pattern_small', 'pattern_large'];
      const promises = styles.map(style => generateBackground(
        { base64: logoImage.base64.split(',')[1], mimeType: logoImage.file.type },
        style
      ));
      const results = await Promise.all(promises);
      setBackgrounds(results.map(base64 => `data:image/png;base64,${base64}`));
      setAppState(AppState.SELECTING_BACKGROUND);
    } catch (err: any) {
      setError(err.message || 'Failed to generate backgrounds.');
      setAppState(AppState.UPLOADING);
    }
  }, [logoImage]);

  const handleBackgroundSelect = useCallback(async (selectedBgBase64: string) => {
    if (!productImage) return;
    setAppState(AppState.COMBINING_IMAGES);
    setError(null);
    try {
      // The service expects the raw base64 string, not the data URI
      const productB64 = productImage.base64.split(',')[1];
      const backgroundB64 = selectedBgBase64.split(',')[1];

      const result = await combineProductWithBackground(
        { base64: productB64, mimeType: productImage.file.type },
        { base64: backgroundB64, mimeType: 'image/png' } // Assuming generated bg is png
      );
      setFinalImage(`data:image/png;base64,${result}`);
      setAppState(AppState.DISPLAYING_RESULT);
    } catch (err: any) {
      setError(err.message || 'Failed to combine images.');
      setAppState(AppState.SELECTING_BACKGROUND);
    }
  }, [productImage]);

  const handleRefineImage = async (maskBase64: string) => {
    if (!finalImage) return;
    setIsEditModalOpen(false);
    setAppState(AppState.REFINING_IMAGE);
    setError(null);
    try {
        const originalImageB64 = finalImage.split(',')[1];
        const result = await refineImage(
            { base64: originalImageB64, mimeType: 'image/png' },
            { base64: maskBase64, mimeType: 'image/png' }
        );
        setFinalImage(`data:image/png;base64,${result}`);
    } catch (err: any) {
        setError(err.message || 'Failed to refine image.');
    } finally {
        setAppState(AppState.DISPLAYING_RESULT);
    }
  };

  const handleReset = () => {
    setProductImage(null);
    setLogoImage(null);
    setBackgrounds([]);
    setFinalImage(null);
    setAppState(AppState.UPLOADING);
    setError(null);
    setIsEditModalOpen(false);
  };

  const getLoadingMessage = () => {
    switch(appState) {
      case AppState.GENERATING_BACKGROUNDS:
        return "Creando fondos de marca con IA... Esto puede tardar un momento.";
      case AppState.COMBINING_IMAGES:
        return "Combinando tu producto con el fondo... ¡Casi listo!";
      case AppState.REFINING_IMAGE:
        return "Aplicando retoques mágicos a tu imagen...";
      default:
        return "Cargando...";
    }
  }

  const renderContent = () => {
    if (appState === AppState.GENERATING_BACKGROUNDS || appState === AppState.COMBINING_IMAGES || appState === AppState.REFINING_IMAGE) {
      return <Spinner message={getLoadingMessage()} />;
    }
    
    if (appState === AppState.SELECTING_BACKGROUND) {
      return <BackgroundSelector backgrounds={backgrounds} onSelect={handleBackgroundSelect} />;
    }

    if (appState === AppState.DISPLAYING_RESULT && finalImage) {
      return (
        <div className="text-center flex flex-col items-center gap-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold flex items-center justify-center gap-3">
                    <div className="bg-amber-500 text-gray-900 rounded-full h-8 w-8 flex items-center justify-center font-bold text-lg shrink-0">3</div>
                    ¡Tu Imagen Está Lista!
                </h2>
                <p className="text-gray-400 mt-2">Descarga tu imagen o haz algunos retoques finales.</p>
            </div>

            <div className="relative group w-full max-w-2xl rounded-2xl overflow-hidden border-2 border-gray-700">
                <img src={finalImage} alt="Final product" className="w-full h-auto object-contain" />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-500 transition-all duration-300 transform hover:scale-105"
                >
                    <Icon type="wand" className="w-5 h-5"/>
                    <span>Refinar Imagen</span>
                </button>
                 <a
                    href={finalImage}
                    download="product-image.png"
                    className="flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-500 transition-all duration-300 transform hover:scale-105"
                >
                    Descargar
                </a>
                <button
                    onClick={handleReset}
                    className="flex items-center justify-center gap-2 bg-gray-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-500 transition-all duration-300 transform hover:scale-105"
                >
                    Empezar de Nuevo
                </button>
            </div>
        </div>
      );
    }
    
    return (
      <>
        <div className="text-center mb-12">
            <h2 className="text-3xl font-bold flex items-center justify-center gap-3"><div className="bg-amber-500 text-gray-900 rounded-full h-8 w-8 flex items-center justify-center font-bold text-lg shrink-0">1</div>Sube Tus Imágenes</h2>
            <p className="text-gray-400 mt-2">Proporciona una imagen de tu producto y el logo de tu marca.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          <ImageInput
            id="product-image"
            label="Imagen del Producto"
            image={productImage}
            onImageChange={handleProductImageChange}
            icon="product"
            step={1}
          />
          <ImageInput
            id="logo-image"
            label="Logo de la Marca"
            image={logoImage}
            onImageChange={handleLogoImageChange}
            icon="logo"
            step={2}
          />
        </div>
        {productImage && logoImage && (
          <button
            onClick={handleGenerateBackgrounds}
            className="mt-12 bg-amber-500 text-gray-900 font-bold py-4 px-8 rounded-lg text-xl hover:bg-amber-400 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-amber-500/20"
          >
            Generar Fondos
          </button>
        )}
      </>
    );
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <main className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-screen">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-extrabold tracking-tight text-amber-400">Generador de Imágenes de Producto con IA</h1>
          <p className="text-xl text-gray-300 mt-4 max-w-3xl mx-auto">
            Crea imágenes de marketing profesionales para tus productos en segundos. Solo sube tu producto, tu logo, y deja que la magia suceda.
          </p>
        </header>

        {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative mb-8 w-full max-w-4xl" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
                <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
                    <Icon type="close" className="w-5 h-5"/>
                </button>
            </div>
        )}

        {renderContent()}
      </main>
      
      {finalImage && (
        <EditModal 
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            productImage={finalImage}
            onRefine={handleRefineImage}
        />
      )}
    </div>
  );
}

export default App;
