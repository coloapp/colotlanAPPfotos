// Fix: Importing necessary modules from @google/genai.
import { GoogleGenAI, Modality, Part } from "@google/genai";

// Fix: Correct initialization of GoogleGenAI client using a named parameter for the API key.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Utility to convert base64 to a Part for Gemini API
const fileToGenerativePart = (base64: string, mimeType: string): Part => {
    // Remove data URI prefix if it exists
    const pureBase64 = base64.startsWith('data:') ? base64.split(',')[1] : base64;
    return {
        inlineData: {
            data: pureBase64,
            mimeType,
        },
    };
};

export const removeBackground = async (imageBase64: string): Promise<string> => {
    const imagePart = fileToGenerativePart(imageBase64, 'image/png');
    const prompt = `
      Elimina el fondo de esta imagen. Devuelve únicamente la imagen del sujeto con un fondo transparente en formato PNG.
      No alteres, recortes ni modifiques el sujeto de ninguna manera. El resultado debe ser un recorte limpio.
    `;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
            parts: [{ text: prompt }, imagePart]
        },
        config: {
            responseModalities: [Modality.IMAGE],
        }
    });

    if (response.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
        const part = response.candidates[0].content.parts[0];
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }

    throw new Error("La IA no pudo eliminar el fondo.");
};


export const generateInitialDesigns = async (productPng: string, logoPng: string): Promise<string[]> => {
    const productPart = fileToGenerativePart(productPng, 'image/png');
    const logoPart = fileToGenerativePart(logoPng, 'image/png');

    const prompt = `
      Se te proporcionará una imagen de producto con fondo transparente y una imagen de logo con fondo transparente.
      REGLA MÁS IMPORTANTE: NO ALTERES, EDITES, DEFORMES NI MODIFIQUES las imágenes del producto o del logo proporcionadas de ninguna manera. Úsalas tal como están.
      
      Tu tarea es crear 4 escenas de estudio fotorrealistas y de alta calidad:
      1. Coloca la imagen del producto en un entorno de estudio limpio y minimalista (por ejemplo, sobre un podio, una superficie reflectante o con sombras suaves).
      2. Integra sutilmente la imagen del logo en el fondo de la escena (por ejemplo, en una pared, como una proyección de luz o en un elemento de la escena).
      3. Asegúrate de que la iluminación del producto coincida con la iluminación de la escena que crees.
      4. El resultado deben ser 4 imágenes de calidad publicitaria. No agregues texto. Devuelve solo las 4 imágenes.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
            parts: [
                { text: prompt },
                productPart,
                logoPart,
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.IMAGE, Modality.IMAGE, Modality.IMAGE],
        },
    });

    const designs: string[] = [];
    if (response.candidates && response.candidates.length > 0) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes = part.inlineData.data;
                const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
                designs.push(imageUrl);
            }
        }
    }
    
    if (designs.length < 4) {
        throw new Error("La IA no pudo generar los 4 diseños. Inténtalo de nuevo.");
    }

    return designs;
};

export const refineBackground = async (productImage: string, maskImage: string): Promise<string> => {
    const productPart = fileToGenerativePart(productImage, 'image/png');
    const maskPart = fileToGenerativePart(maskImage, 'image/png');

    const prompt = `
      Usando la imagen del producto y la imagen de la máscara proporcionadas:
      1. La máscara es negra donde el usuario quiere eliminar partes de la imagen del producto original.
      2. Rellena el área enmascarada (negra) utilizando el contexto del fondo circundante. La meta es eliminar el objeto o área marcada de forma natural.
      3. Devuelve solo la imagen editada.
    `;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
            parts: [
                { text: prompt },
                productPart,
                maskPart
            ]
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        }
    });

    if (response.candidates && response.candidates.length > 0) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
    }

    throw new Error("No se pudo refinar la imagen.");
};


export const generateBatchImages = async (mainImage: string): Promise<string[]> => {
    const imagePart = fileToGenerativePart(mainImage, 'image/png');

    const prompt = `
        Basado en la imagen principal proporcionada, genera 4 imágenes de primer plano (close-up) fotorrealistas adicionales.
        Cada imagen debe centrarse en un detalle diferente del producto o mostrarlo desde un ángulo ligeramente diferente.
        Mantén el mismo estilo, iluminación y fondo que la imagen principal para asegurar la consistencia.
        No incluyas el logo en estas imágenes.
        Devuelve solo las 4 imágenes.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
            parts: [
                { text: prompt },
                imagePart,
            ],
        },
        config: {
             responseModalities: [Modality.IMAGE, Modality.IMAGE, Modality.IMAGE, Modality.IMAGE],
        },
    });

    const images: string[] = [];
    if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                 images.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
            }
        }
    }

    if (images.length === 0) {
        throw new Error("No se pudieron generar las imágenes del lote.");
    }
    
    return images;
};


export const createVideoAd = async (
    mainImage: string, 
    batchImages: string[], 
    logoImage: string, 
    headline: string,
    socials: { tiktok: string, facebook: string, whatsapp: string }
): Promise<string> => {
    const prompt = `
        Crea un anuncio en video corto y dinámico para redes sociales (estilo revista de moda).
        
        Secuencia:
        1. (2s) Apertura con la imagen principal. Agrega un sutil efecto de zoom o paneo.
        2. (4s) Transiciones rápidas y elegantes mostrando cada una de las 4 imágenes de detalle del lote.
        3. (3s) Escena de cierre con el logo de la marca y la información de redes sociales.
        
        Texto superpuesto:
        - Si se proporciona un titular, muéstralo elegantemente durante la escena de apertura. Titular: "${headline}"
        - En la escena de cierre, muestra los siguientes identificadores de redes sociales si se proporcionan: TikTok: ${socials.tiktok}, Facebook: ${socials.facebook}, WhatsApp: ${socials.whatsapp}.
        
        Estilo:
        - Moderno, limpio, profesional y de alta gama.
        - Utiliza música de fondo upbeat y libre de derechos de autor.
    `;
    
    let operation = await ai.models.generateVideos({
      model: 'veo-2.0-generate-001',
      prompt: prompt,
      image: {
        imageBytes: mainImage.split(',')[1],
        mimeType: 'image/png',
      },
      config: {
        numberOfVideos: 1
      }
    });
    
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({operation: operation});
    }
    
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

    if (!downloadLink) {
        throw new Error("No se pudo generar el video. El enlace de descarga no está disponible.");
    }
    
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!response.ok) {
        throw new Error(`Error al descargar el video: ${response.statusText}`);
    }

    const videoBlob = await response.blob();
    
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(videoBlob);
    });
};