"use server";
import { OpenAI } from "openai";
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Ensure this is set in your .env
});



export async function generateCompletionWithContext(context: string, input:string) {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: `Answer based on the provided context.
  Context: ${context}` },
        { role: "user", content: input }
      ]
      
    });
  
   return completion.choices[0].message.content;
}