import { generateStory as deepseekGenerate } from "@/lib/deepseek";

// Adds storytelling-specific prompting and formatting
export async function generateStory(prompt: string): Promise<string> {
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY is not configured");
  }

  const enhancedPrompt = `
Create a compelling and engaging story segment based on the following prompt.
Make it concise but impactful, focusing on advancing the narrative in an interesting way.
Keep the tone consistent and ensure it can be continued later.

Prompt: ${prompt}
  `.trim();

  try {
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "You are a creative storyteller specializing in interactive narratives that evolve over time. Create engaging story segments that can be built upon.",
          },
          {
            role: "user",
            content: enhancedPrompt,
          },
        ],
        max_tokens: 500, // Limit the length to keep stories concise
        temperature: 0.8, // Add some randomness for creativity
      }),
    });

    if (!response.ok) {
      throw new Error(`Deepseek API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Failed to generate story:", error);
    throw new Error("Story generation failed. Please try again.");
  }
}
