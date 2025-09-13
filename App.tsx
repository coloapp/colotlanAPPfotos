import React, { useState, useCallback, useEffect } from 'react';
import ImageInput from './components/ImageInput';
import Spinner from './components/Spinner';
import EditModal from './components/EditModal';
import TrainingLibrary from './components/TrainingLibrary';
import { Icon } from './components/Icon';
import type { ImageFile, TrainingExample, BackgroundStyle } from './types';
import { generateBrandedImage } from './services/geminiService';

enum AppState {
  UPLOADING,
  GENERATING,
  DISPLAYING_RESULT,
  REFINING,
}

function App() {
  const [productImage, setProductImage] = useState<ImageFile | null>(null);
  const [logoImage, setLogoImage] = useState<ImageFile | null>(null);
  const [finalImage, setFinalImage] = useState<string | null>(null);
  const [originalImageForRefine, setOriginalImageForRefine] = useState<string | null>(null);
  const [appState, setAppState] = useState<AppState>(AppState.UPLOADING);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [trainingExamples, setTrainingExamples] = useState<TrainingExample[]>([]);

  useEffect(() => {
    try {
      const storedExamples = localStorage.getItem('trainingExamples');
      if (storedExamples) {
        setTrainingExamples(JSON.parse(storedExamples));
      }
    } catch (e) {
      console.error("Failed to load training examples from localStorage", e);
      localStorage.removeItem('trainingExamples');
    }
  }, []);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleImageChange = async (file: File, type: 'product' | 'logo') => {
    try {
      const base64 = await fileToBase64(file);
      const imageFile = { file, base64 };
      if (type === 'product') {
        setProductImage(imageFile);
      } else {
        setLogoImage(imageFile);
      }
    } catch (err) {
      setError(`Error al procesar la imagen de ${type}.`);
    }
  };
  
  const handleGenerateClick = useCallback(async (maskBase64?: string) => {
    // For a new generation, we need both images.
    if (!maskBase64 && (!productImage || !logoImage)) return;

    // For refining, we need the original product image.
    if (maskBase64 && !originalImageForRefine) {
        setError("No se encontró la imagen original para refinar.");
        return;
    }

    setAppState(maskBase64 ? AppState.REFINING : AppState.GENERATING);
    setError(null);
    setIsEditModalOpen(false);

    try {
        const imageToProcess = maskBase64 ? originalImageForRefine! : productImage!.base64;
        
        const result = await generateBrandedImage(
            { base64: imageToProcess.split(',')[1], mimeType: 'image/png' },
            { base64: logoImage!.base64.split(',')[1], mimeType: logoImage!.file.type },
            maskBase64 ? { base64: maskBase64, mimeType: 'image/png' } : undefined
        );
        setFinalImage(`data:image/png;base64,${result}`);
        if (!maskBase64) {
            setOriginalImageForRefine(productImage!.base64); // Save original for potential refining
        }
    } catch (err: any) {
        setError(err.message || 'No se pudo generar la imagen.');
    } finally {
        setAppState(AppState.DISPLAYING_RESULT);
    }
  }, [productImage, logoImage, originalImageForRefine]);


  const handleSaveExample = () => {
    if (!originalImageForRefine || !logoImage || !finalImage) {
        setError("Faltan datos para guardar el ejemplo.");
        return;
    }
    const newExample: TrainingExample = {
        id: new Date().toISOString(),
        originalProductImage: originalImageForRefine,
        logoImage: logoImage.base64,
        // Using a placeholder as this flow doesn't have multiple styles
        backgroundStyle: 'watermark', 
        finalImage: finalImage,
    };
    const newExamples = [...trainingExamples, newExample];
    setTrainingExamples(newExamples);
    localStorage.setItem('trainingExamples', JSON.stringify(newExamples));
    alert("Ejemplo guardado en la Biblioteca de Entrenamiento!");
  };

  const handleReset = () => {
    setProductImage(null);
    setLogoImage(null);
    setFinalImage(null);
    setOriginalImageForRefine(null);
    setAppState(AppState.UPLOADING);
    setError(null);
    setIsEditModalOpen(false);
  };

  const getLoadingMessage = () => {
    switch(appState) {
      case AppState.GENERATING:
        return "Procesando tu imagen con IA... Esto puede tardar un momento.";
      case AppState.REFINING:
        return "Aplicando retoques mágicos a tu imagen...";
      default:
        return "Cargando...";
    }
  }

  const renderContent = () => {
    if (appState === AppState.GENERATING || appState === AppState.REFINING) {
      return <Spinner message={getLoadingMessage()} />;
    }
    
    if (appState === AppState.DISPLAYING_RESULT && finalImage) {
      return (
        <div className="text-center flex flex-col items-center gap-8 w-full">
            <div className="text-center">
                <h2 className="text-3xl font-bold">¡Tu Imagen Está Lista!</h2>
                <p className="text-gray-400 mt-2">Descarga, refina o guarda este resultado.</p>
            </div>

            <div className="relative group w-full max-w-2xl rounded-2xl overflow-hidden border-2 border-gray-700">
                <img src={finalImage} alt="Final product" className="w-full h-auto object-contain" />
            </div>

            <div className="flex flex-wrap justify-center gap-4">
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
                    onClick={handleSaveExample}
                    className="flex items-center justify-center gap-2 bg-sky-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-sky-500 transition-all duration-300 transform hover:scale-105"
                >
                    <Icon type="save" className="w-5 h-5" />
                    <span>Guardar Ejemplo</span>
                </button>
                <button
                    onClick={handleReset}
                    className="flex items-center justify-center gap-2 bg-gray-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-500 transition-all duration-300"
                >
                    Empezar de Nuevo
                </button>
            </div>
        </div>
      );
    }
    
    return (
      <div className="w-full flex flex-col items-center">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Sube Tus Imágenes</h2>
            <p className="text-gray-400 mt-2">La IA quitará el fondo de tu producto y añadirá tu logo.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
           <ImageInput
            id="product-image"
            label="1. Sube tu Producto"
            image={productImage}
            onImageChange={(file) => handleImageChange(file, 'product')}
            icon="product"
            step="1"
          />
          <ImageInput
            id="logo-image"
            label="2. Sube tu Logo"
            image={logoImage}
            onImageChange={(file) => handleImageChange(file, 'logo')}
            icon="logo"
            step="2"
          />
        </div>
        {productImage && logoImage && appState === AppState.UPLOADING && (
          <button
            onClick={() => handleGenerateClick()}
            className="mt-12 bg-amber-500 text-gray-900 font-bold py-4 px-8 rounded-lg text-xl hover:bg-amber-400 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-amber-500/20"
          >
            Generar Imagen
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <main className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-screen">
        <header className="text-center mb-12 relative w-full">
          <h1 className="text-5xl font-extrabold tracking-tight text-amber-400">Branding de Productos con IA</h1>
          <p className="text-xl text-gray-300 mt-4 max-w-3xl mx-auto">
            Resultados profesionales en segundos. Sube, genera y perfecciona.
          </p>
          <button 
            onClick={() => setIsLibraryOpen(true)}
            className="absolute top-0 right-0 bg-gray-700/50 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
            title="Abrir Biblioteca de Entrenamiento"
          >
             <Icon type="library" className="w-5 h-5"/>
             <span>Biblioteca</span>
          </button>
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
      
      {originalImageForRefine && (
        <EditModal 
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            productImage={originalImageForRefine}
            onRefine={(mask) => handleGenerateClick(mask)}
        />
      )}
      <TrainingLibrary 
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        examples={trainingExamples}
        setExamples={setTrainingExamples}
      />
    </div>
  );
}

export default App;
