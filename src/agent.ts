import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY is missing from environment variables.");
}

const ai = new GoogleGenerativeAI(apiKey || "dummy");

export interface AnalyzeProblemInput {
  postId: string;
  title: string;
  description: string;
  categorySlug: string;
  attachmentUrls?: string[];
}

export interface AnalyzeProblemOutput {
  diagnosis: string;
  suggestedSolutions: string[];
  confidenceScore: number;
}

const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    diagnosis: {
      type: SchemaType.STRING,
      description: "A professional and calming diagnosis of the problem described.",
    },
    suggestedSolutions: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.STRING,
      },
      description: "A list of actionable steps or solutions.",
    },
    confidenceScore: {
      type: SchemaType.NUMBER,
      description: "A confidence score between 0.0 and 1.0",
    },
  },
  required: ["diagnosis", "suggestedSolutions", "confidenceScore"],
};

export async function analyzeProblem(input: AnalyzeProblemInput): Promise<AnalyzeProblemOutput> {
  const prompt = `
You are an expert technical diagnostician for the category: "${input.categorySlug}".
A user has reported a problem. Analyze the details and provide a diagnosis and suggested solutions.

Title: ${input.title}
Description: ${input.description}
Attachments: ${input.attachmentUrls?.length ? input.attachmentUrls.length + ' attachments provided' : 'None'}

Please provide a calming and accurate diagnosis, a few actionable solutions, and a confidence score.
`;

  try {
    const model = ai.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const response = await model.generateContent(prompt);
    const text = response.response.text();
    if (text) {
      return JSON.parse(text) as AnalyzeProblemOutput;
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("AI Generation Error:", error);
    // Return a graceful fallback if the AI fails or the API key is missing.
    return {
      diagnosis: "AI analysis is currently unavailable. Please rely on community feedback.",
      suggestedSolutions: ["Wait for community experts to provide a solution."],
      confidenceScore: 0.0,
    };
  }
}
