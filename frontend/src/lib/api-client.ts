import { z } from 'zod'

/**
 * Thin typed fetch wrapper (spec 0001, "HTTP client" row).
 * Every response is parsed through a caller-supplied Zod schema, so no
 * unvalidated backend payload ever reaches app code (spec 0001 security
 * baseline: schema-validated input at every boundary).
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined

// In-memory only. Never persisted to localStorage or sessionStorage: spec
// 0001 rejects storing the access token anywhere an XSS bug could read it.
let accessToken: string | null = null

export function setAccessToken(token: string | null): void {
  accessToken = token
}

export class ApiError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export class ApiValidationError extends Error {
  readonly issues: z.ZodIssue[]

  constructor(message: string, issues: z.ZodIssue[]) {
    super(message)
    this.name = 'ApiValidationError'
    this.issues = issues
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | undefined
  body?: unknown
  signal?: AbortSignal | undefined
}

async function request<TSchema extends z.ZodType>(
  path: string,
  schema: TSchema,
  options: RequestOptions = {},
): Promise<z.infer<TSchema>> {
  if (!API_BASE_URL) {
    throw new Error(
      'VITE_API_BASE_URL is not set. Configure it per environment; never hardcode an API origin.',
    )
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
  }
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  const init: RequestInit = {
    method: options.method ?? 'GET',
    headers,
    // Sends the httpOnly refresh cookie (spec 0001) on same-site requests;
    // the access token itself never lives in a cookie or storage.
    credentials: 'include',
  }
  if (options.body !== undefined) {
    init.body = JSON.stringify(options.body)
  }
  if (options.signal !== undefined) {
    init.signal = options.signal
  }

  const response = await fetch(new URL(path, API_BASE_URL), init)

  const contentType = response.headers.get('content-type') ?? ''
  const raw: unknown = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    throw new ApiError(`Request to ${path} failed with ${response.status}`, response.status, raw)
  }

  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    throw new ApiValidationError(
      `Response from ${path} did not match the expected shape`,
      parsed.error.issues,
    )
  }

  return parsed.data
}

function withOptions(
  method: NonNullable<RequestOptions['method']>,
  body?: unknown,
  signal?: AbortSignal,
): RequestOptions {
  const options: RequestOptions = { method }
  if (body !== undefined) options.body = body
  if (signal !== undefined) options.signal = signal
  return options
}

export const apiClient = {
  get: <TSchema extends z.ZodType>(path: string, schema: TSchema, signal?: AbortSignal) =>
    request(path, schema, withOptions('GET', undefined, signal)),
  post: <TSchema extends z.ZodType>(path: string, schema: TSchema, body?: unknown, signal?: AbortSignal) =>
    request(path, schema, withOptions('POST', body, signal)),
  put: <TSchema extends z.ZodType>(path: string, schema: TSchema, body?: unknown, signal?: AbortSignal) =>
    request(path, schema, withOptions('PUT', body, signal)),
  patch: <TSchema extends z.ZodType>(path: string, schema: TSchema, body?: unknown, signal?: AbortSignal) =>
    request(path, schema, withOptions('PATCH', body, signal)),
  delete: <TSchema extends z.ZodType>(path: string, schema: TSchema, signal?: AbortSignal) =>
    request(path, schema, withOptions('DELETE', undefined, signal)),
}
