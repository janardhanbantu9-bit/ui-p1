import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function askGroq(input) {
  const response = await client.responses.create({
    model: "openai/gpt-oss-120b",
    input,
  });

  return response.output_text;
}