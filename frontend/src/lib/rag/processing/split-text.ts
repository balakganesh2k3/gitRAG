"use server";

import { encode, decode } from "gpt-tokenizer";

// Splits input text into chunks of roughly equal token size for processing
export async function splitText(text: string) {
  const chunks: string[] = [];
  // Target size for each chunk in tokens
  const CHUNK_SIZE = 500;

  try {
    // Convert text to token IDs
    const tokens = encode(text);

    // Split tokens into chunks of CHUNK_SIZE
    for (let i = 0; i < tokens.length; i += CHUNK_SIZE) {
      // Get subset of tokens for this chunk
      const chunkTokens = tokens.slice(i, i + CHUNK_SIZE);
      // Convert token IDs back to text
      const chunk = decode(chunkTokens);
      chunks.push(chunk);
    }

    return chunks;
  } catch (error) {
    console.error("Error in splitText:", error);
    return [];
  }
}
