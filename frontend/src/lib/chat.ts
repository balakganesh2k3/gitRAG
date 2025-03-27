import { rateLimit } from './middlewares/rate-limit'
import { chatMessageSchema } from './utils/input-validation'
import { runRagPipeline } from './rag/retrieval/run-rag-pipeline'
import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function POST(req: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await rateLimit(req)
  if (rateLimitResponse.status === 429) {
    return rateLimitResponse
  }

  try {
    // Validate input
    const body = await req.json()
    const validatedData = chatMessageSchema.parse(body)

    // Check authentication and permissions
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })
    const { data: { session } } = await supabase.auth.getSession()

    // Get repository permissions
    const { data: repo } = await supabase
      .from('repositories')
      .select('permissions, allowed_domains')
      .eq('id', validatedData.repoId)
      .single()

    if (!repo) {
      return NextResponse.json(
        { error: 'Repository not found' },
        { status: 404 }
      )
    }

    // Validate domain access
    const origin = req.headers.get('origin')
    if (repo.allowed_domains?.length && !repo.allowed_domains.includes(origin)) {
      return NextResponse.json(
        { error: 'Unauthorized domain' },
        { status: 403 }
      )
    }

    // Run RAG pipeline with security context
    const response = await runRagPipeline(validatedData.message, {
      ...validatedData.context,
      repoId: validatedData.repoId,
      userId: session?.user?.id,
      isAdmin: session?.user?.user_metadata?.role === 'admin'
    })

    return NextResponse.json({ response })

  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}
