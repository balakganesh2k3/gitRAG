import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Redis } from '@upstash/redis'

// Initialize Redis client - Redis is an in-memory data store used here for rate limiting
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL || '',
  token: process.env.UPSTASH_REDIS_TOKEN || ''
})

// Configure rate limiting window
const RATE_LIMIT_REQUESTS = 50 // Maximum requests allowed per window
const RATE_LIMIT_WINDOW = 60 * 60 // Window size in seconds (1 hour)

export async function rateLimit(request: NextRequest) {
  // Get client IP from various headers
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const ip = forwardedFor 
    ? forwardedFor.split(',')[0].trim() 
    : realIP 
      ? realIP 
      : 'unknown'

  const key = `rate-limit:${ip}`

  // Increment request counter in Redis and set expiry if first request
  const current = await redis.incr(key)
  if (current === 1) {
    await redis.expire(key, RATE_LIMIT_WINDOW)
  }

  if (current > RATE_LIMIT_REQUESTS) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }

  return NextResponse.next()
}
