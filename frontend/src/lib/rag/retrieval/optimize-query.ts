import OpenAI from 'openai';

// Add debug logging for API key
console.log('API Key status:', process.env.OPENAI_API_KEY ? 'Present' : 'Missing');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function getOptimizedQuery(query: string) {
    try {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OpenAI API key is not set in environment variables');
        }
        // Call OpenAI API to optimize the query
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Using smaller model for better latency/cost
            messages: [
                {
                    role: "system",
                    content: `You are an AI assistant tasked with optimizing queries for a RAG (Retrieval-Augmented Generation) system. Your goal is to refine the original query to improve the retrieval of relevant information from the knowledge base.
            
            Follow these guidelines to optimize the query:
            1. Remove unnecessary words or phrases that don't contribute to the core meaning.
            2. Identify and emphasize key concepts or entities.
            3. Use more specific or technical terms if appropriate.
            4. Ensure the query is clear and concise.
            5. Maintain the original intent of the query.
            
            Output only the refined query text, without any additional explanation or formatting, on a single line.
        
            Examples:
            -"What are the best ways to improve memory?" -> "Improve memory"
            -"How does climate change affect biodiversity in tropical regions?" -> "Climate change impact on tropical biodiversity"
            -"What are the symptoms of COVID-19?" -> "COVID-19 symptoms"
            -"How can I learn to play the guitar?" -> "Learn guitar basics"
            -"What is the capital of France?" -> "Capital of France"`
        
                },
                { role: "user", content: query } // Pass original query as user message
            ]
        });
        
        // Extract and return the optimized query text
        return response.choices[0].message.content ?? query;
    } catch (error: any) {
        // Enhanced error logging
        console.error('OpenAI API Error:', {
            status: error?.status,
            message: error?.message,
            type: error?.type
        });

        if (error?.status === 401 || error?.message?.includes('invalid api token')) {
            throw new Error('OpenAI API key is invalid or not configured. Please ensure OPENAI_API_KEY is set correctly in your .env file');
        }
        throw new Error(`Failed to optimize query: ${error.message}`);
    }
}