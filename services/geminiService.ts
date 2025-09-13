import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash-image-preview';

function fileToGenerativePart(base64: string, mimeType: string) {
  return {
    inlineData: {
      data: base64,
      mimeType,
    },
  };
}

async function generateSingleImage(parts: any[], config?: any): Promise<string> {
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: model,
    contents: { parts },
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
      ...config,
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }
  throw new Error("La IA no generó una imagen. Por favor, inténtalo de nuevo.");
}

export type BackgroundStyle = 'watermark' | 'pattern_small' | 'pattern_large';

export const generateBackground = async (
  logoImage: { base64: string; mimeType: string },
  style: BackgroundStyle
): Promise<string> => {
  const logoPart = fileToGenerativePart(logoImage.base64, logoImage.mimeType);
  let prompt = '';

  switch (style) {
    case 'watermark':
      prompt = 'Usando el logo proporcionado, crea un fondo de marketing limpio y profesional. El logo debe estar grande, centrado y con una opacidad reducida (aproximadamente 30-40%) para que actúe como una marca de agua sobre un fondo blanco o de color muy claro. La salida debe ser solo la imagen de fondo.';
      break;
    case 'pattern_small':
      prompt = 'Usando el logo proporcionado, crea un fondo de patrón simétrico y repetitivo. El logo debe ser pequeño y estar distribuido de manera uniforme por todo el lienzo sobre un fondo blanco o de color claro. El resultado debe ser elegante y profesional, adecuado para una presentación de producto. La salida debe ser solo la imagen de fondo.';
      break;
    case 'pattern_large':
      prompt = 'Usando el logo proporcionado, crea un fondo de patrón. El logo debe ser de un tamaño mediano-grande y repetirse menos veces que en un patrón denso, manteniendo un espacio generoso entre cada repetición. El fondo debe ser blanco o de un color muy claro. El diseño debe ser audaz pero profesional. La salida debe ser solo la imagen de fondo.';
      break;
  }
  
  return generateSingleImage([logoPart, { text: prompt }]);
};


export const combineProductWithBackground = async (
  productImage: { base64: string; mimeType: string },
  backgroundImage: { base64: string; mimeType: string }
): Promise<string> => {
  const productPart = fileToGenerativePart(productImage.base64, productImage.mimeType);
  const backgroundPart = fileToGenerativePart(backgroundImage.base64, backgroundImage.mimeType);
  
  const prompt = `Actúa como un experto en edición de fotos de e-commerce. Tarea:
1.  La primera imagen es un producto con un fondo aleatorio.
2.  La segunda imagen es un fondo de marca diseñado profesionalmente.
3.  Tu única misión es recortar el producto de la primera imagen con una precisión quirúrgica, eliminando su fondo original por completo.
4.  No alteres, modifiques ni redibujes el producto de ninguna manera. Debe conservar sus píxeles, texturas y colores originales.
5.  Superpón el producto recortado y limpio sobre la segunda imagen (el fondo de marca).
6.  La salida final debe ser únicamente la imagen compuesta.`;
  
  return generateSingleImage([productPart, backgroundPart, { text: prompt }]);
};

export const refineImage = async (
  originalImage: { base64: string; mimeType: string },
  maskImage: { base64: string; mimeType: string }
): Promise<string> => {
  const originalPart = fileToGenerativePart(originalImage.base64, originalImage.mimeType);
  const maskPart = fileToGenerativePart(maskImage.base64, maskImage.mimeType);
  
  const prompt = "Eres un editor de imágenes experto. Usa la segunda imagen como una máscara. Rellena el área enmascarada de la primera imagen para que se mezcle perfectamente con el contexto circundante, eliminando eficazmente cualquier objeto o artefacto dentro de la máscara. La salida debe ser solo la imagen final editada.";
  
  return generateSingleImage([originalPart, maskPart, { text: prompt }]);
};