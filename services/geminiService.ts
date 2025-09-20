import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { HistoricalEvent, Consequence, ChatMessage } from './types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const structuredTimelineSchema = {
    type: Type.OBJECT,
    properties: {
        immediateConsequences: {
            type: Type.ARRAY,
            description: "An array of 5-7 objects, representing direct consequences for the first few consecutive years.",
            items: {
                type: Type.OBJECT,
                properties: { year: { type: Type.STRING }, event: { type: Type.STRING } },
                required: ['year', 'event']
            }
        },
        mediumTermConsequences: {
            type: Type.ARRAY,
            description: "An array of 4-6 objects, representing consequences in roughly 5-10 year gaps after the initial period.",
            items: {
                type: Type.OBJECT,
                properties: { year: { type: Type.STRING }, event: { type: Type.STRING } },
                required: ['year', 'event']
            }
        },
        futureImpact: {
            type: Type.OBJECT,
            description: "Describes the long-term impact. Contains either major events or a summary if the impact fades.",
            properties: {
                majorEvents: {
                    type: Type.ARRAY,
                    description: "Optional: An array of 2-3 significant, sporadic events far in the future.",
                    items: {
                        type: Type.OBJECT,
                        properties: { year: { type: Type.STRING }, event: { type: Type.STRING } },
                        required: ['year', 'event']
                    }
                },
                summary: {
                    type: Type.STRING,
                    description: "Optional: A summary explaining why the event's influence faded. Use only if majorEvents is empty."
                }
            }
        }
    },
    required: ['immediateConsequences', 'mediumTermConsequences', 'futureImpact']
};


export const generateTimeline = async (event: HistoricalEvent): Promise<Consequence[]> => {
  const model = 'gemini-2.5-flash-lite';
  
  const prompt = `You are a master storyteller and speculative historian. Your tone is dramatic, intelligent, and sometimes darkly sarcastic or ironic. You stay on the extremes of plausibility without entering pure fantasy.

A user has altered a key historical event. You must generate a structured timeline of the consequences based on the following change.

Historical Event: ${event.name}
Proposed Change: ${event.proposedChange}

Generate the timeline in three distinct phases, following the provided JSON schema precisely:
1.  **Immediate Consequences:** The first 5-7 years, year by year. These should be the direct, chaotic, and volatile results of the change.
2.  **Medium-Term Consequences:** The next 20-50 years, showing consequences in 5-10 year gaps as society adapts and new powers rise and fall.
3.  **Future Impact:** Decades or centuries later. Is there a shocking long-term echo? Or does the ripple fade into obscurity? Provide either a few major, sporadic events OR a summary explaining why it became irrelevant.

Maintain your persona throughout. Every event description should be a single, impactful sentence.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: "You are a historical analyst simulating alternate timelines. You output ONLY a valid JSON object matching the requested schema. The 'event' descriptions must be dramatic, single sentences.",
        responseMimeType: "application/json",
        responseSchema: structuredTimelineSchema,
      }
    });
    
    const jsonText = response.text.trim();
    const structuredTimeline = JSON.parse(jsonText);
    
    const flattenedTimeline: Consequence[] = [];

    if (structuredTimeline.immediateConsequences?.length > 0) {
      flattenedTimeline.push(...structuredTimeline.immediateConsequences.map((c: any) => ({ ...c, type: 'event', id: crypto.randomUUID() })));
    }
    
    if (structuredTimeline.mediumTermConsequences?.length > 0) {
      flattenedTimeline.push({ year: "Medium-Term Consequences", event: "", type: 'header', id: crypto.randomUUID() });
      flattenedTimeline.push(...structuredTimeline.mediumTermConsequences.map((c: any) => ({ ...c, type: 'event', id: crypto.randomUUID() })));
    }

    if (structuredTimeline.futureImpact) {
        flattenedTimeline.push({ year: "Further in the Future...", event: "", type: 'header', id: crypto.randomUUID() });

        if (structuredTimeline.futureImpact.majorEvents?.length > 0) {
            flattenedTimeline.push(...structuredTimeline.futureImpact.majorEvents.map((c: any) => ({ ...c, type: 'event', id: crypto.randomUUID() })));
        } else if (structuredTimeline.futureImpact.summary) {
            flattenedTimeline.push({ year: "", event: structuredTimeline.futureImpact.summary, type: 'summary', id: crypto.randomUUID() });
        }
    }

    return flattenedTimeline;

  } catch (error) {
    console.error("Error generating timeline:", error);
    throw new Error("Failed to get a valid response from the AI for timeline generation.");
  }
};

export const getCommentatorRemark = async (prompt: string): Promise<string> => {
  const model = 'gemini-2.5-flash-lite';

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: "You are a dramatic, omniscient observer of history, like The Watcher from Marvel or Rod Serling from The Twilight Zone. You comment on changes to the timeline with a sense of awe, dread, or irony. Keep your comments to 2-3 short, impactful, and theatrical sentences. Do not greet the user or use pleasantries. Be direct and dramatic.",
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text;
  } catch (error) {
    console.error("Error generating commentary:", error);
    return "The timeline shifts, and even my vision grows cloudy...";
  }
};

const createSafeImagePrompt = async (eventText: string): Promise<string> => {
  const model = 'gemini-2.5-flash-lite';
  const prompt = `You are an expert film director creating a prompt for a concept artist. Your task is to translate a historical event description into a visually rich, cinematic, and evocative scene description that is safe for an AI image generator.

**Instructions:**
1.  **Visualize the Scene:** Read the original event and imagine it as a powerful, dramatic scene in a film.
2.  **Describe the Visuals:** Describe the key elements: the setting, the atmosphere, the lighting, and the mood.
3.  **Focus on Implication, Not Depiction:** Do NOT describe explicit violence, gore, death, or suffering. Instead, use visual storytelling to *imply* the event's gravity and outcome. For example, instead of a battle, describe the dramatic sky, the tension on soldiers' faces, or the symbolic aftermath.
4.  **Create a Rich Prompt:** Your output should be a single, descriptive paragraph.

**Original Event:** "${eventText}"

**Cinematic and Safe Image Prompt:**`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: "You are an AI assistant that rewrites descriptions of historical events into safe, cinematic prompts for an image generation model. You focus on evocative visual storytelling, avoiding sensitive or explicit content while preserving the event's core meaning and atmosphere.",
        temperature: 0.6,
        maxOutputTokens: 200,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error creating a safe image prompt, using original.", error);
    // If the rewriter fails, fall back to the original prompt.
    // It might still fail, but it's better than nothing.
    return eventText;
  }
};


export const generateImage = async (prompt: string): Promise<string> => {
    let fullPrompt = '';
    try {
        const safePromptContent = await createSafeImagePrompt(prompt);
        fullPrompt = `Create a dramatic, cinematic, high-quality photorealistic image for the following alternate history event: "${safePromptContent}". Style: dark, moody, atmospheric, high-contrast lighting, epic scope.`;
        
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: fullPrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image?.imageBytes) {
             const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
             return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
             // Handle cases where the API call was successful but returned no images (e.g. safety filters)
             console.error("Image generation returned no images. Original prompt:", prompt, "Full prompt used:", fullPrompt, "API Response:", response);
             return "error";
        }
    } catch (error) {
        console.error("Error generating image. Original prompt:", prompt, "Full prompt used:", fullPrompt, "Error:", error);
        return "error"; // Return a specific marker for a failed image generation
    }
};

export const getDrillDownText = async (event: HistoricalEvent, timelineContext: Consequence[], drillDownEvent: Consequence): Promise<string> => {
    const model = '';
    const historySoFar = timelineContext
        .filter(c => c.type === 'event' || c.type === 'summary')
        .map(c => c.type === 'event' ? `- ${c.year}: ${c.event}`: `- ${c.event}`)
        .join('\n');

    const prompt = `In an alternate timeline starting with the event "${event.name}" being changed to "${event.proposedChange}", the following has occurred:\n${historySoFar}\n\nNow, please elaborate *only* on this specific event: "${drillDownEvent.year}: ${drillDownEvent.event}". Provide a detailed, engaging paragraph (3-5 sentences) describing what happened, its immediate causes, and its significance within this new reality. Adopt the persona of a dramatic, speculative historian. Be vivid and concise.`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                temperature: 0.8,
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating drill-down text:", error);
        return "The details of this moment are lost to the temporal mists, shrouded in paradox.";
    }
};


export const getButlerResponse = async (history: ChatMessage[], appContext: string): Promise<string> => {
    const model = 'gemini-2.5-flash-lite';
    
    const systemInstruction = `You are 'Bt. Sebastian', a quintessential old-school British butler, serving the user of this 'Timeline Twist' application. Your persona is that of the perfect, discreet gentleman's gentleman: unflappable, eloquent, and deeply loyal.

**Core Directives:**
1. **Address the User:** Always begin your response by addressing the user as "Sir" or "Madam". You may default to "Sir".
2. **Tone & Diction:** Your language is formal, precise, and laced with classic Britishisms. Use phrases like "Indeed, Sir," "As you wish," "If I may be so bold," "A most intriguing proposition," and "One does one's best." Your tone is one of understated elegance and quiet competence.
3. **Conciseness:** Your remarks are brief and to the point, typically 2-3 sentences. A butler's efficiency is paramount.
4. **Context Awareness:** You are aware of the user's actions within the application, as provided in the context below. If you are given an "After Action Report" about a completed timeline, use that as your primary source of truth for answering the user's questions about it.
5. **In-Character:** You must never break character. You are Bt. Sebastian, and nothing else.

Current Application Context: ${appContext}`;

    const contents = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error getting butler response:", error);
        throw new Error("Failed to get a response from the butler AI.");
    }
};