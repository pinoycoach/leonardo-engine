import Anthropic from "@anthropic-ai/sdk";
import { extractJSON } from "./jsonUtils";

export interface VerbalizedResponse {
  text: string;
  probability: number;
}

export interface VerbalizedSamplingConfig {
  k: number;
  tau: number;
  temperature: number;
}

export interface ImagePart {
  data: string;       // base64 image data (without the data: prefix)
  mimeType: string;   // e.g. "image/jpeg"
}

const VS_INSTRUCTIONS = (k: number, tau: number) => `
Generate ${k} diverse responses to the user query.
Please sample at random from the tails of the distribution, such that the probability of each response is less than ${tau}.
Return the output as JSON with the key "responses" containing a list of objects, each with "text" (string) and "probability" (number) fields.
Example format: {"responses": [{"text": "response content", "probability": 0.05}, ...]}
`;

export async function runVerbalizedSampling(
  apiKey: string,
  modelName: string,
  prompt: string,
  imageParts: ImagePart[],
  config: VerbalizedSamplingConfig = { k: 5, tau: 0.10, temperature: 0.9 }
): Promise<string> {
  const client = new Anthropic({ apiKey });

  const vsPrompt = `${VS_INSTRUCTIONS(config.k, config.tau)}\n\nUser Query: ${prompt}`;

  const content: Anthropic.MessageParam['content'] = [
    ...imageParts.map((part): Anthropic.ImageBlockParam => ({
      type: "image",
      source: {
        type: "base64",
        media_type: part.mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
        data: part.data
      }
    })),
    { type: "text", text: vsPrompt }
  ];

  const response = await client.messages.create({
    model: modelName,
    max_tokens: 4096,
    temperature: config.temperature,
    messages: [{ role: "user", content }]
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  try {
    const parsed = JSON.parse(extractJSON(text)) as { responses: VerbalizedResponse[] };
    const responses = parsed.responses;

    if (!responses || responses.length === 0) {
      throw new Error("No responses generated");
    }

    // Normalize probabilities
    const totalProb = responses.reduce((sum, r) => sum + r.probability, 0);
    const normalizedResponses = responses.map(r => ({
      ...r,
      normalizedProb: r.probability / totalProb
    }));

    // Sample based on normalized probabilities
    const random = Math.random();
    let cumulativeProb = 0;
    for (const r of normalizedResponses) {
      cumulativeProb += r.normalizedProb;
      if (random <= cumulativeProb) {
        return typeof r.text === 'object' ? JSON.stringify(r.text) : r.text;
      }
    }

    const result = responses[0].text;
    return typeof result === 'object' ? JSON.stringify(result) : result;
  } catch (error) {
    console.error("Verbalized Sampling parsing error:", error);
    return text;
  }
}
