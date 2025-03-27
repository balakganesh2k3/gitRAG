"use server";
import { splitText } from "./split-text";
import { generateEmbeddings } from "../generate/generate-embeddings";
import { db } from "../../../backend/db";
import { documentsTable } from "../../../backend/db/schema/repo-table";

export async function processDocument(text: string, repositoryId: string, fileName: string) {
    try {
        // 1️⃣ Split text into chunks
        const chunks = await splitText(text);

        // 2️⃣ Generate embeddings
        const embeddings = await generateEmbeddings(chunks);

        // 3️⃣ Insert chunks into documentsTable
        await db.insert(documentsTable).values(
            chunks.map((chunk, i) => ({
                repository_id: repositoryId,
                file_name: `${fileName}-chunk-${i}`,
                content: chunk,
                embedding: embeddings[i]
            }))
        );

        console.log("✅ Document processed successfully!");
    } catch (error: any) {
        if (error?.statusCode === 401 || error?.message?.includes('invalid api token')) {
            console.error("❌ Authentication Error: Invalid or missing API token");
            throw new Error("Authentication failed - please check your API token");
        }
        
        if (error instanceof Error) {
            console.error("❌ Error processing document:", error.message);
            throw error;
        }
        
        console.error("❌ Error processing document:", error);
        throw new Error("An unexpected error occurred while processing the document");
    }
}

