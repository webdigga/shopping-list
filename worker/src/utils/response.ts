import type { Env } from '../index'

export function corsHeaders(env: Env): HeadersInit {
  const origin = env.ENVIRONMENT === 'production'
    ? env.ALLOWED_ORIGIN
    : '*'

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
}

export function json(data: unknown, status: number, env: Env): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(env),
    },
  })
}

export function cors(env: Env): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(env),
  })
}
