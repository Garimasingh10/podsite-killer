import { suggestPodcastDescription } from '../lib/ai/openai';

async function testSuggest() {
    console.log('Testing suggestPodcastDescription...');
    try {
        const suggestion = await suggestPodcastDescription(
            'The AI Revolution',
            'A podcast about how AI is changing the world.'
        );
        console.log('Suggestion:', suggestion);
    } catch (error) {
        console.error('Error:', error);
    }
}

testSuggest();
