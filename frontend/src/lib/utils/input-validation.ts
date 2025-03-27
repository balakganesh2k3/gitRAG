import { z } from 'zod'

export const chatMessageSchema = z.object({
  message: z.string()
    .min(1, "Message cannot be empty")
    .max(1000, "Message too long")
    .transform(msg => sanitizeInput(msg)),
  repoId: z.string().uuid(),
  context: z.object({
    allowCode: z.boolean(),
    allowDocs: z.boolean(),
    allowIssues: z.boolean()
  }).default({
    allowCode: false,
    allowDocs: true,
    allowIssues: false
  })
})

export const repositorySchema = z.object({
  url: z.string()
    .url("Invalid GitHub URL")
    .regex(/^https:\/\/github\.com\/[\w-]+\/[\w-]+$/i, "Invalid GitHub repository URL"),
  patToken: z.string()
    .regex(/^ghp_[a-zA-Z0-9]{36}$/, "Invalid PAT token format")
    .optional()
})

function sanitizeInput(input: string): string {
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[^\w\s.,!?-]/g, '') // Only allow basic punctuation and alphanumeric
    .trim()
}
