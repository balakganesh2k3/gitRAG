import { pgTable, text, timestamp, boolean, vector, uuid } from "drizzle-orm/pg-core";

export const repositoriesTable = pgTable("repositories", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    owner: text("owner").notNull(),
    repo_url: text("repo_url").notNull().unique(),
    private: boolean("private").default(false),
    pat_token: text("pat_token"),
    status: text("status").default('pending'),
    error_message: text("error_message"),
    created_at: timestamp("created_at").defaultNow().notNull()
});

export const documentsTable = pgTable("documents", {
    id: uuid("id").primaryKey().defaultRandom(),
    repository_id: uuid("repository_id").references(() => repositoriesTable.id),
    file_name: text("file_name").notNull(),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }),
    created_at: timestamp("created_at").defaultNow().notNull()
});

export type InsertFacts = typeof repositoriesTable.$inferInsert;
export type SelectFacts = typeof repositoriesTable.$inferSelect;


