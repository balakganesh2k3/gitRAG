"use server"
import { getOptimizedQuery } from "./optimize-query";
import { retrieveDocuments } from "./retrieve-dcouments";
import { rankDocuments } from "./rerank-documents";


export async function runRagPipeline(query: string) {
    const optimizedQuery = await getOptimizedQuery(query);
    console.log("Optimized query:", optimizedQuery);

    const retrievedDoc = await retrieveDocuments(optimizedQuery, {
        limit: 25,
        minSimilarity: 0.2,

    });

    console.log("Retrieved documents:", retrievedDoc);
    console.log("Retrieved documents count:", retrievedDoc.length);
    const rankedResults = await rankDocuments(optimizedQuery, retrievedDoc, 5);
    console.log("final ranked results:", rankedResults);

    return rankedResults;
}