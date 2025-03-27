"use server";

import { OpenAI } from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Ensure this is set in your .env
});

export async function generateEmbeddings(texts: string[]) {
    try {
        // Generate embeddings using OpenAI
        const response = await openai.embeddings.create({
            model: "text-embedding-3-small", // You can also use "text-embedding-ada-002"
            input: texts,
        });

        if (!response || !response.data) {
            console.warn("⚠️ No embeddings received from OpenAI.");
            return texts.map(() => new Array(256).fill(0)); // Return zero vectors if response fails
        }

        // Extract embeddings
        const embeddings = response.data.map((item) => item.embedding);

        // 🔹 Ensure all embeddings are exactly 256D
        return embeddings.map((embedding) => {
            if (embedding.length > 256) {
                return embedding.slice(0, 256); // Truncate
            } else if (embedding.length < 256) {
                return [...embedding, ...new Array(256 - embedding.length).fill(0)]; // Pad with zeros
            }
            return embedding;
        });

    } catch (error) {
        console.error("❌ Error generating embeddings:", error);
        return texts.map(() => new Array(256).fill(0)); // Return zero vectors on failure
    }
}
