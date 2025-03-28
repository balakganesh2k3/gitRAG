import { loadEnvConfig } from "@next/env";
import { repositoriesTable, documentsTable } from "./schema/repo-table";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";

loadEnvConfig(process.cwd());

const databaseUrl = process.env.VITE_APP_SUPABASE_URL;

if (!databaseUrl) {
    throw new Error("VITE_APP_SUPABASE_URL is not set");
}

const dbSchema = {
    repositories: repositoriesTable,
    documents: documentsTable
};

function initializeDb(url: string) {
    const client = new Client({ 
        connectionString: url,
        ssl: { rejectUnauthorized: false } // Required for Supabase
    });
    client.connect();
    return drizzle(client, { schema: dbSchema });
}

export const db = initializeDb(databaseUrl);














