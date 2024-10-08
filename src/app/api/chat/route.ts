import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenerativeAIStream, StreamingTextResponse } from "ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export const runtime = "edge";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const geminiStream = await genAI
    .getGenerativeModel({ model: "gemini-1.5-flash" })
    .generateContentStream({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: "You are a kind and empathetic mental health therapist. Provide supportive and helpful responses to the user's messages.",
            },
          ],
        },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }],
        })),
      ],
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

  const stream = GoogleGenerativeAIStream(geminiStream);
  return new StreamingTextResponse(stream);
}
