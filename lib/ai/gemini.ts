import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key_for_build');

export async function suggestPodcastDescription(title: string, currentDescription: string) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not set');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are a strict summarization assistant.
    Use ONLY the provided podcast data. Do NOT invent names, dates, or details. 
    If information is missing, do not guess.
    
    Podcast Title: "${title}"
    Known Description: "${currentDescription}"
    
    Task: Write a compelling, premium, and concise SEO-optimized description for this podcast (max 2 sentences). 
    Your tone should be professional and informative.
    Return ONLY the description text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
}

/**
 * VISION AI: Analyze a screenshot and return structured ThemeConfig
 */
export async function generateThemeFromImage(imageBase64: string | null, userText?: string) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not set');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    let prompt = `Analyze this screenshot of a website and extract its design system.
    
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

    if (!imageBase64) {
        prompt = `Generate a website design system based on this description.
        
        User Preference: "${userText || 'Modern and professional'}"

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

        Use modern defaults and ensure good contrast.
        Return ONLY valid JSON.`;
    }

    let contents: any[] = [prompt];

    if (imageBase64) {
        // Extract mime type and base64 data
        const match = imageBase64.match(/^data:(image\/\w+);base64,(.+)$/);
        if (!match) throw new Error('Invalid image format. Expected data:image/...;base64,...');

        const mimeType = match[1];
        const data = match[2];

        contents.push({
            inlineData: {
                data,
                mimeType
            }
        });
    }

    const result = await model.generateContent(contents);

    const response = await result.response;
    const text = response.text();
    
    // Clean up response (Gemini sometimes adds markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('AI failed to return a valid JSON object');
    
    return JSON.parse(jsonMatch[0]);
}
