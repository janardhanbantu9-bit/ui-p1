import { askGroq } from "../backend/services/groqServices.js";

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.message || typeof body.message !== "string") {
      return Response.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const reply = await askGroq(body.message);

    return Response.json({ reply });
  } catch (error) {
    console.error("Groq API error:", error);

    return Response.json(
      { error: "Failed to contact Groq" },
      { status: 500 }
    );
  }
}