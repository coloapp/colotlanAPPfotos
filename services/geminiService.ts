import { GoogleGenAI, Modality } from "@google/genai";
import type { BackgroundStyle } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface ImageInput {
  base64: string;
  mimeType: string;
}

/**
 * Generates a branded product image by removing the background, adding a logo, and placing it on a clean background.
 */
export const generateBrandedImage = async (productImage: ImageInput, logoImage: ImageInput, maskImage?: ImageInput): Promise<string> => {
  const parts: any[] = [
    {
      inlineData: {
        data: productImage.base64,
        mimeType: productImage.mimeType,
      },
    },
    {
      inlineData: {
        data: logoImage.base64,
        mimeType: logoImage.mimeType,
      },
    },
  ];

  let prompt = `
    Actúa como un fotógrafo de productos y editor de fotos de e-commerce de élite. Tu única misión es preparar una imagen de producto para la venta online.
    
    Se te proporcionan dos imágenes:
    1. La imagen principal del producto.
    2. La imagen del logotipo.

    Tus tareas son las siguientes, en este orden exacto:
    1.  **PRESERVAR EL PRODUCTO ORIGINAL:** La imagen del producto principal debe permanecer 100% idéntica. NO la redibujes, NO la alteres, NO cambies sus colores, texturas o iluminación. Debe ser la foto original.
    2.  **ELIMINAR EL FONDO:** Elimina el fondo de la imagen del producto con precisión quirúrgica. El resultado debe ser solo el producto con un fondo transparente.
    3.  **CREAR UN FONDO NUEVO:** Crea un fondo de color blanco puro (#FFFFFF).
    4.  **COMPOSICIÓN:** Coloca el producto (con su fondo ya eliminado) sobre el fondo blanco.
    5.  **AÑADIR LOGO:** Coloca el logotipo de la segunda imagen en la esquina inferior derecha de la imagen final. El logo debe ser discreto pero legible.
  `;

  if (maskImage) {
    parts.push({
      inlineData: {
        data: maskImage.base64,
        mimeType: maskImage.mimeType,
      },
    });
    prompt += `
      **¡INSTRUCCIÓN PRIORITARIA DE REFINAMIENTO!**
      Se proporciona una tercera imagen que es una máscara de eliminación. Las áreas pintadas en esta máscara indican elementos que DEBEN ser eliminados junto con el fondo. Esta orden anula cualquier otra interpretación. Asegúrate de que todo lo que está debajo de la máscara desaparezca por completo.
    `;
  }
  
  parts.push({ text: prompt });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    contents: { parts },
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  // Robust response validation
  if (
    response.candidates &&
    response.candidates.length > 0 &&
    response.candidates[0].finishReason !== 'SAFETY' && // Check for safety blocks
    response.candidates[0].content &&
    response.candidates[0].content.parts &&
    Array.isArray(response.candidates[0].content.parts)
  ) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.data) {
        return part.inlineData.data;
      }
    }
  } else if (response.candidates && response.candidates[0].finishReason === 'SAFETY') {
     throw new Error('La generación de la imagen fue bloqueada por razones de seguridad. Intenta con una imagen diferente.');
  }

  throw new Error('La IA no pudo generar una imagen. Por favor, inténtalo de nuevo.');
};
