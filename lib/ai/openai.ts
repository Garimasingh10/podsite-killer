import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy_key_for_build',
});

export async function suggestPodcastDescription(title: string, currentDescription: string) {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not set');
    }

    const prompt = `You are a strict summarization assistant.
    Use ONLY the provided podcast data. Do NOT invent names, dates, or details. 
    If information is missing, do not guess.
    
    Podcast Title: "${title}"
    Known Description: "${currentDescription}"
    
    Task: Write a compelling, premium, and concise SEO-optimized description for this podcast (max 2 sentences). 
    Your tone should be professional and informative.
    Return ONLY the description text.`;

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: prompt }
        ],
    });

    return response.choices[0].message.content?.trim() || "";
}

/**
 * VISION AI: Analyze a screenshot and return structured ThemeConfig
 */
export async function generateThemeFromImage(imageBase64: string, userText?: string) {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not set');
    }

    const prompt = `Analyze this screenshot of a website and extract its design system.
    
    Task: Identify the color palette, typography styles, and layout structure.
    Optional User Preference: "${userText || 'None provided'}"

    Output your findings STRICTLY as a JSON object matching this schema:
    {
      "primaryColor": "hex string",
      "backgroundColor": "hex string",
      "accentColor": "hex string",
      "fontHeading": "Standard Google Font name (e.g. 'Inter', 'Fraunces')",
      "fontBody": "Standard Google Font name",
      "cornerRadius": "0px or 8px or 16px",
      "layout": "netflix or substack or genz or minimal"
    }

    If you cannot determine a value, use modern defaults (Inter, #0ea5e9, netflix).
    Return ONLY valid JSON.`;

    // Extract mime type and base64 data
    const match = imageBase64.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!match) throw new Error('Invalid image format. Expected data:image/...;base64,...');

    const mimeType = match[1];
    const data = match[2];

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "user",
                content: [
                    { type: "text", text: prompt },
                    {
                        type: "image_url",
                        image_url: {
                            url: `data:${mimeType};base64,${data}`,
                        },
                    },
                ],
            },
        ],
        response_format: { type: "json_object" },
    });

    const text = response.choices[0].message.content;
    if (!text) throw new Error('AI failed to return a valid JSON object');
    
    return JSON.parse(text);
}
