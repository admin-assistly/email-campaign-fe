import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function generateEmailResponse(originalMessage: string, customerName: string) {
  const prompt = `
You are a helpful customer support agent. Generate a professional and friendly response to the following email:

${originalMessage}

The response should:
1. Address the customer by name (${customerName})
2. Answer their questions directly and clearly
3. Be helpful and informative
4. Thank them for their interest
5. Include a professional sign-off
`

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: prompt,
    })

    return text
  } catch (error) {
    console.error("Error generating AI response:", error)
    return "Error generating AI response. Please try again."
  }
}
