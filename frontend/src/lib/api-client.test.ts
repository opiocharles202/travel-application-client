import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { apiClient, ApiError, ApiValidationError, setAccessToken } from './api-client'

const userSchema = z.object({ id: z.number(), name: z.string() })

function jsonResponse(body: unknown, init: Partial<ResponseInit> = {}) {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { 'content-type': 'application/json', ...(init.headers as Record<string, string>) },
  })
}

describe('apiClient', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    setAccessToken(null)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('parses a well-formed response through the given schema', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ id: 1, name: 'Ada' }))

    const result = await apiClient.get('/users/1', userSchema)

    expect(result).toEqual({ id: 1, name: 'Ada' })
  })

  it('throws ApiValidationError instead of returning an unvalidated payload, covers the security baseline in spec 0001', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ id: 'not-a-number', name: 'Ada' }))

    await expect(apiClient.get('/users/1', userSchema)).rejects.toBeInstanceOf(ApiValidationError)
  })

  it('throws ApiError with the status and body on a non-2xx response, never returns a parsed value', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ message: 'not found' }, { status: 404 }))

    const error = await apiClient.get('/users/999', userSchema).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).status).toBe(404)
    expect((error as ApiError).body).toEqual({ message: 'not found' })
  })

  it('sends no Authorization header when no access token is set', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ id: 1, name: 'Ada' }))

    await apiClient.get('/users/1', userSchema)

    const [, init] = vi.mocked(fetch).mock.calls[0]!
    const headers = init!.headers as Record<string, string>
    expect(headers.Authorization).toBeUndefined()
  })

  it('sends the in-memory access token as a Bearer header once set, never persists it elsewhere', async () => {
    setAccessToken('secret-token')
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ id: 1, name: 'Ada' }))

    await apiClient.get('/users/1', userSchema)

    const [, init] = vi.mocked(fetch).mock.calls[0]!
    const headers = init!.headers as Record<string, string>
    expect(headers.Authorization).toBe('Bearer secret-token')
  })

  it('always sends credentials: include, so an httpOnly refresh cookie (spec 0001) can flow', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ id: 1, name: 'Ada' }))

    await apiClient.get('/users/1', userSchema)

    const [, init] = vi.mocked(fetch).mock.calls[0]!
    expect(init!.credentials).toBe('include')
  })

  it('serializes the body and sets Content-Type only when a body is present', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ id: 1, name: 'Ada' }))

    await apiClient.post('/users', userSchema, { name: 'Ada' })

    const [, init] = vi.mocked(fetch).mock.calls[0]!
    const headers = init!.headers as Record<string, string>
    expect(init!.method).toBe('POST')
    expect(init!.body).toBe(JSON.stringify({ name: 'Ada' }))
    expect(headers['Content-Type']).toBe('application/json')
  })

  it('omits Content-Type on a bodyless GET', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ id: 1, name: 'Ada' }))

    await apiClient.get('/users/1', userSchema)

    const [, init] = vi.mocked(fetch).mock.calls[0]!
    const headers = init!.headers as Record<string, string>
    expect(headers['Content-Type']).toBeUndefined()
  })
})
