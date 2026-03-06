import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key_for_build');

export async function suggestPodcastDescription(title: string, currentDescription: string) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not set');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an expert podcast marketer. 
    Podcast Title: "${title}"
    Current Description: "${currentDescription}"
    
    Task: Write a compelling, premium, and concise SEO-optimized description for this podcast (max 2 sentences). 
    Return only the description text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
}
