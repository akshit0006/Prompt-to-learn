import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";

const ai = env.hasGemini ? new GoogleGenAI({ apiKey: env.geminiApiKey }) : null;

export const createHinglishNarration = async (text) => {
  const transcript = await translateToHinglish(text);

  if (!ai) {
    return { transcript, audioBase64: null, mimeType: null, provider: "demo" };
  }

  try {
    const response = await ai.models.generateContent({
      model: env.geminiTtsModel,
      contents: [
        {
          role: "user",
          parts: [{ text: `Speak this Hinglish lesson explanation clearly for a student:\n\n${transcript}` }]
        }
      ],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: "Kore"
            }
          }
        }
      }
    });

    const audioPart = response.candidates?.[0]?.content?.parts?.find((part) => part.inlineData);

    return {
      transcript,
      audioBase64: audioPart?.inlineData?.data || null,
      mimeType: audioPart?.inlineData?.mimeType || "audio/wav",
      provider: audioPart ? "gemini" : "gemini-no-audio"
    };
  } catch (err) {
    console.warn("Gemini TTS failed. Returning transcript only.", err.message);
    return { transcript, audioBase64: null, mimeType: null, provider: "transcript-only" };
  }
};

const translateToHinglish = async (text) => {
  if (!ai) return `Demo Hinglish explanation: ${text.slice(0, 1200)}`;

  try {
    const response = await ai.models.generateContent({
      model: env.geminiModel,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Translate and simplify this lesson into friendly Hinglish for Indian learners. Keep technical terms understandable and concise:\n\n${text.slice(0, 5000)}`
            }
          ]
        }
      ],
      config: { temperature: 0.35 }
    });

    return response.text || text;
  } catch (err) {
    console.warn("Gemini translation failed. Returning source excerpt.", err.message);
    return text.slice(0, 1600);
  }
};
