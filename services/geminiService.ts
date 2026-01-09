
import { GoogleGenAI, Type } from "@google/genai";
import { Difficulty, LessonContent } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Função auxiliar para sleep (necessária para o retry)
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function generateLessonContent(
  difficulty: Difficulty,
  lessonTitle: string,
  lessonId: string,
  retries = 3
): Promise<LessonContent> {
  const prompt = `
    Atue como um Professor de Guitarra especializado. Gere uma aula detalhada para o nível ${difficulty} sobre o tema: "${lessonTitle}".
    
    Diretrizes Cruciais:
    1. Explique a teoria (Campo Harmônico, Graus 1, 2, 3...) de forma didática e técnica.
    2. NUNCA use números romanos (I, II, III). Use sempre números normais (1, 2, 3).
    3. OBRIGATÓRIO: No campo "label" das notas do fretboard, coloque o NÚMERO DO GRAU e o NOME DA NOTA (Ex: "1 - C", "2 - D", "b3 - Eb", "5 - G").
    4. Forneça notas para um diagrama de braço (fretboard).
    5. Crie uma progressão de acordes focada no campo harmônico.
    6. Crie um "Desafio do Dia" prático e técnico, curto e objetivo para telas de celular.
    7. O tom deve ser encorajador, profissional e de mestre para aluno.
    8. Corrija gramática e ortografia (Português Brasil).

    REGRAS PARA A TABLATURA (scaleTab):
    - DEVE ser no formato ASCII tradicional de 6 linhas (e, B, G, D, A, E).
    - Certifique-se de que os números representem trastes reais dentro do contexto da aula.
  `;

  try {
    const response = await ai.models.generateContent({
      // Fix: Use gemini-3-pro-preview for complex text tasks like music theory and tab generation.
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            theory: { type: Type.STRING },
            fretboardNotes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  string: { type: Type.NUMBER, description: "Corda (1-6, sendo 1 a mais fina/e)" },
                  fret: { type: Type.NUMBER, description: "Traste (0 para corda solta)" },
                  label: { type: Type.STRING, description: "Número do Grau e Nota (ex: 1 - C, b3 - Eb)." },
                  isRoot: { type: Type.BOOLEAN }
                },
                required: ["string", "fret", "label"]
              }
            },
            fretboardRange: {
              type: Type.ARRAY,
              items: { type: Type.NUMBER },
              description: "Array com [trasteInicial, trasteFinal]"
            },
            scaleTab: { type: Type.STRING, description: "Tablatura ASCII de 6 linhas" },
            suggestedBpm: { type: Type.NUMBER },
            progression: {
              type: Type.OBJECT,
              properties: {
                chords: { type: Type.ARRAY, items: { type: Type.STRING } },
                explanation: { type: Type.STRING }
              }
            },
            challenge: { type: Type.STRING }
          },
          required: ["title", "theory", "fretboardNotes", "fretboardRange", "scaleTab", "suggestedBpm", "progression", "challenge"]
        }
      }
    });

    // Fix: Use response.text.trim() for safer JSON parsing as per guidelines.
    const text = response.text.trim();
    const rawData = JSON.parse(text);
    return { ...rawData, id: lessonId };
  } catch (error: any) {
    // Se for erro de quota (429) e ainda houver tentativas, espera e tenta de novo
    if (error?.status === 429 && retries > 0) {
      await sleep(2000 * (4 - retries)); // Backoff exponencial simples
      return generateLessonContent(difficulty, lessonTitle, lessonId, retries - 1);
    }
    throw error;
  }
}
