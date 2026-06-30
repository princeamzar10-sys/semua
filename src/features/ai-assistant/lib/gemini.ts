import { GoogleGenAI } from '@google/genai'

export const MODEL_ID = 'gemini-2.5-flash'

let _client: GoogleGenAI | null = null

export function getGeminiClient(): GoogleGenAI {
  if (!_client) {
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not set')
    _client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  }
  return _client
}

export type GeminiMessage = {
  role: 'user' | 'model'
  parts: { text: string }[]
}

export async function callGemini(
  systemPrompt: string,
  history: GeminiMessage[],
  userMessage: string
): Promise<string> {
  const client = getGeminiClient()

  const contents: GeminiMessage[] = [
    ...history,
    { role: 'user', parts: [{ text: userMessage }] },
  ]

  const response = await client.models.generateContent({
    model: MODEL_ID,
    contents,
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.1,
      maxOutputTokens: 1024,
    },
  })

  return response.text ?? ''
}
