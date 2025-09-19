
import { GoogleGenAI, Modality, Part } from "@google/genai";

const fileToGenerativePart = async (file: File): Promise<Part> => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const generateImageVariations = async (
  baseImages: File[],
  characterPrompt: string,
  backgroundPrompt: string,
  removeBackground: boolean,
  width: number,
  height: number,
  aspectRatio: string
): Promise<string[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is not set.");
  }
  const ai = new GoogleGenAI({ apiKey });
  
  const imageParts = await Promise.all(baseImages.map(fileToGenerativePart));
  
  let fullPrompt = '';
  if (removeBackground) {
    fullPrompt = `Isolate the main subject(s) from the provided image(s) and remove the background completely. The resulting image should only contain the subject(s) on a transparent background.`;
    if (characterPrompt) {
      fullPrompt += ` Additionally, modify the subject(s) based on this description: ${characterPrompt}.`;
    }
  } else {
    fullPrompt = `Using the provided image(s) as a base, generate a new image.`;
    if (characterPrompt) {
      fullPrompt += ` Character description: ${characterPrompt}.`;
    }
    if (backgroundPrompt) {
      fullPrompt += ` Background, space, etc.: ${backgroundPrompt}.`;
    }
    if (width > 0 && height > 0) {
      fullPrompt += ` The output image must be exactly ${width}px by ${height}px. It is critical to adhere to these dimensions.`;
    } else if (aspectRatio) {
      fullPrompt += ` It is absolutely critical that the final output image has an aspect ratio of ${aspectRatio}. Recompose the image, extend the scenery, or crop if necessary to strictly meet this ${aspectRatio} aspect ratio. Do not deviate from this aspect ratio.`;
    }
  }

  const textPart = { text: fullPrompt };

  // Call the API 4 times in parallel to get 4 results
  const promises = Array(4).fill(0).map(() => 
    ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: { parts: [...imageParts, textPart] },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    })
  );

  const responses = await Promise.all(promises);

  const imageUrls = responses.map(response => {
    // Check for candidates and parts before accessing
    const parts = response?.candidates?.[0]?.content?.parts;
    if (!parts) return null;

    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        const base64ImageBytes = part.inlineData.data;
        // The API should return a png with transparency when asked to remove background
        const mimeType = part.inlineData.mimeType || 'image/png';
        return `data:${mimeType};base64,${base64ImageBytes}`;
      }
    }
    return null;
  }).filter((url): url is string => url !== null);

  if (imageUrls.length < 4) {
    console.warn("Could not generate all 4 images. Some results may be missing.");
  }

  return imageUrls;
};