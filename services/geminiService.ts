import { GoogleGenAI, Type, GenerateContentResponse, Chat } from "@google/genai";
import { StudyPlanEntry, Flashcard, QuizQuestion, ChatMessage } from "../types";
// Corrected import path for constants.tsx to ensure esm.sh resolves it
import { GEMINI_PRO_MODEL, GEMINI_FLASH_MODEL } from "../constants.tsx";

// Fix: Initialize GoogleGenAI as per guidelines. API_KEY is expected to be present.
// The warning for process.env.API_KEY can remain.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable is not set. Gemini API calls may fail.");
}

// Helper to extract text safely
function extractText(response: GenerateContentResponse): string {
  // Use a fallback to an empty string if response.text is undefined
  return response.text ?? "";
}

// --- Study Plan Generator ---
export async function generateStudyPlan(
  subject: string,
  examDate: string, // YYYY-MM-DD
  weeklyHours: number,
  notesContent: string,
): Promise<StudyPlanEntry[]> {
  const prompt = `You are an expert study planner. Create a detailed, day-by-day study plan for the subject "${subject}". The exam is on ${examDate}. The student has approximately ${weeklyHours} hours available per week. The study material is:
  \`\`\`
  ${notesContent}
  \`\`\`
  Return the plan as a JSON array of objects, where each object has 'day' (number), 'date' (YYYY-MM-DD), 'topic' (string), and 'activities' (array of strings). Do not include any introductory or concluding text, only the JSON array. Make sure the plan starts from today's date and ends before the exam date.`;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: GEMINI_PRO_MODEL,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            day: { type: Type.NUMBER, description: 'Day number in the study plan.' },
            date: { type: Type.STRING, description: 'Date for the study activities (YYYY-MM-DD).' },
            topic: { type: Type.STRING, description: 'Main topic for the day.' },
            activities: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'List of study activities for the day.' },
          },
          required: ['day', 'date', 'topic', 'activities'],
          propertyOrdering: ["day", "date", "topic", "activities"],
        },
      },
    },
  });

  const jsonStr = extractText(response);
  try {
    return JSON.parse(jsonStr) as StudyPlanEntry[];
  } catch (e) {
    console.error("Failed to parse study plan JSON:", jsonStr, e);
    throw new Error("No se pudo generar un plan de estudio válido. Por favor, inténtalo de nuevo o refina tu entrada.");
  }
}

// --- Material Analyzer ---
export async function analyzeMaterial(notesContent: string): Promise<{ keyConcepts: string[]; subtopics: string[] }> {
  const prompt = `Analyze the following study material and extract the key concepts and a list of subtopics.
  Material:
  \`\`\`
  ${notesContent}
  \`\`\`
  Return the output as a JSON object with two properties: 'keyConcepts' (an array of strings) and 'subtopics' (an array of strings). Do not include any introductory or concluding text, only the JSON object.`;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: GEMINI_PRO_MODEL,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          keyConcepts: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'List of key concepts extracted from the material.' },
          subtopics: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'List of subtopics extracted from the material.' },
        },
        required: ['keyConcepts', 'subtopics'],
        propertyOrdering: ["keyConcepts", "subtopics"],
      },
    },
  });

  const jsonStr = extractText(response);
  try {
    const parsed = JSON.parse(jsonStr);
    return {
      keyConcepts: parsed.keyConcepts || [],
      subtopics: parsed.subtopics || [],
    };
  } catch (e) {
    console.error("Failed to parse material analysis JSON:", jsonStr, e);
    throw new Error("No se pudo analizar el material. Por favor, inténtalo de nuevo o refina tu entrada.");
  }
}

// --- Flashcard Generator ---
export async function generateFlashcards(notesContent: string): Promise<Flashcard[]> {
  const prompt = `Generate 5-10 flashcards (question/answer pairs) from the following study material.
  Material:
  \`\`\`
  ${notesContent}
  \`\`\`
  Return the flashcards as a JSON array of objects, where each object has 'question' (string) and 'answer' (string). Do not include any introductory or concluding text, only the JSON array.`;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: GEMINI_PRO_MODEL,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING, description: 'Question for the flashcard.' },
            answer: { type: Type.STRING, description: 'Answer to the flashcard question.' },
          },
          required: ['question', 'answer'],
          propertyOrdering: ["question", "answer"],
        },
      },
    },
  });

  const jsonStr = extractText(response);
  try {
    return JSON.parse(jsonStr) as Flashcard[];
  } catch (e) {
    console.error("Failed to parse flashcards JSON:", jsonStr, e);
    throw new Error("No se pudieron generar flashcards. Por favor, inténtalo de nuevo o refina tu entrada.");
  }
}

// --- Quiz Generator ---
export async function generateQuiz(notesContent: string): Promise<QuizQuestion[]> {
  const prompt = `Generate 10 multiple-choice quiz questions based on the following study material. Each question should have 4 options, only one of which is correct. Provide an explanation for the correct answer.
  Material:
  \`\`\`
  ${notesContent}
  \`\`\`
  Return the quiz as a JSON array of objects, where each object has 'question' (string), 'options' (array of 4 strings), 'correctAnswerIndex' (number, 0-3), and 'explanation' (string). Do not include any introductory or concluding text, only the JSON array.`;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: GEMINI_PRO_MODEL,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING, description: 'The quiz question.' },
            options: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Four multiple-choice options.' },
            correctAnswerIndex: { type: Type.NUMBER, description: 'Index (0-3) of the correct answer.' },
            explanation: { type: Type.STRING, description: 'Explanation for the correct answer.' },
          },
          required: ['question', 'options', 'correctAnswerIndex', 'explanation'],
          propertyOrdering: ["question", "options", "correctAnswerIndex", "explanation"],
        },
      },
    },
  });

  const jsonStr = extractText(response);
  try {
    return JSON.parse(jsonStr) as QuizQuestion[];
  } catch (e) {
    console.error("Failed to parse quiz JSON:", jsonStr, e);
    throw new Error("No se pudo generar el cuestionario. Por favor, inténtalo de nuevo o refina tu entrada.");
  }
}

// --- Study Assistant (Chat) ---
export async function startChatSession(): Promise<Chat> {
  return ai.chats.create({
    model: GEMINI_FLASH_MODEL,
    config: {
      systemInstruction: "You are a helpful study assistant. Answer questions clearly and concisely based on academic subjects. If you don't know the answer, politely state that you cannot assist with that specific query.",
    },
  });
}

export async function sendChatMessage(chat: Chat, message: string): Promise<GenerateContentResponse> {
  return chat.sendMessage({ message });
}