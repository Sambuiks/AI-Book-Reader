import { GoogleGenAI, Chat } from "@google/genai";
import { Book, AICommand } from "../types";
import { AI_COMMAND_SYSTEM_INSTRUCTION } from "../constants";

class GeminiService {
  private ai: GoogleGenAI | null = null;
  private chat: Chat | null = null;
  private currentApiKey: string | null = null;

  private initialize(apiKey: string) {
    if (this.ai && this.currentApiKey === apiKey) {
      return;
    }
    this.ai = new GoogleGenAI({ apiKey });
    this.currentApiKey = apiKey;
    this.chat = null;
  }

  async processCommand(
    prompt: string,
    context: {
      currentBook: Book | null;
      currentChapterIndex: number;
      currentPage: number;
      library: Book[];
    },
    apiKey: string
  ): Promise<AICommand> {
    if (!apiKey) {
      return {
        action: 'UNKNOWN',
        payload: { response: "API key is missing. Please add a Google AI API key in settings." }
      };
    }
    this.initialize(apiKey);
    if(!this.ai) {
         return {
            action: 'UNKNOWN',
            payload: { response: "Could not initialize AI service." }
         };
    }

    const contextPrompt = context.currentBook 
        ? `
- Current Book: "${context.currentBook.title}" by ${context.currentBook.author}
- Current Chapter: "${context.currentBook.chapters[context.currentChapterIndex]?.title || 'N/A'}"
- Current Page: ${context.currentPage + 1}
` 
        : `
- Current Book: NULL (User is in the library view)
`;

    const userPrompt = `
CONTEXT:
${contextPrompt}
- Library: [${context.library.map(b => `"${b.title}"`).join(', ')}]

USER COMMAND: "${prompt}"
`;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash-preview-04-17",
        contents: userPrompt,
        config: {
          systemInstruction: AI_COMMAND_SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          temperature: 0,
        },
      });

      let jsonStr = response.text.trim();
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[2]) {
        jsonStr = match[2].trim();
      }
      
      const parsedJson = JSON.parse(jsonStr);
      
      if (parsedJson.action && parsedJson.payload) {
        return parsedJson as AICommand;
      } else {
        throw new Error("Invalid JSON structure received from AI.");
      }

    } catch (error: any) {
      console.error("Gemini Command Processing Error:", error);
      let errorMessage = "Sorry, I had trouble understanding that. Could you try again?";
      if (error instanceof SyntaxError) {
          errorMessage = "There was an issue interpreting the AI's response. Please try again.";
      } else if (error.message) {
          errorMessage = `An API error occurred: ${error.message}`;
      }
      return {
        action: 'UNKNOWN',
        payload: { response: errorMessage }
      };
    }
  }

  async streamChatResponse(
    prompt: string,
    onChunk: (chunk: string) => void,
    onError: (error: string) => void,
    onEnd: () => void,
    apiKey: string
  ): Promise<void> {
    if (!apiKey) {
      onError("API key is missing. Please add a Google AI API key in settings.");
      onEnd();
      return;
    }
    this.initialize(apiKey);
    if (!this.ai) {
      onError("Could not initialize AI service.");
      onEnd();
      return;
    }

    try {
      if (!this.chat) {
        this.chat = this.ai.chats.create({
          model: 'gemini-2.5-flash-preview-04-17',
          config: {
            systemInstruction: 'You are a helpful and friendly chat assistant inside an Ebook reader application. Engage in conversation with the user about the books they are reading or any other topic they bring up.',
          },
        });
      }

      const responseStream = await this.chat.sendMessageStream({ message: prompt });
      
      for await (const chunk of responseStream) {
        onChunk(chunk.text);
      }

    } catch (error: any) {
      console.error("Gemini Chat Streaming Error:", error);
      let errorMessage = "An unknown error occurred during chat.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      onError(errorMessage);
    } finally {
      onEnd();
    }
  }
}

export const geminiService = new GeminiService();
