import { describe, expect, it, mock } from 'bun:test'
import { fetchSocieties, formatInr, grossYield, lowestRent } from '../src/lib/flats-api'

describe('flats-api unit tests', () => {
  it('formats INR values properly', () => {
    expect(formatInr(15000000)).toBe('₹1.5 Cr')
    expect(formatInr(7500000)).toBe('₹75 L')
    expect(formatInr(28000)).toBe('₹28,000')
    expect(formatInr(null)).toBe('–')
  })

  it('calculates gross yield and lowest rent', () => {
    const prices = {
      '2': { buy_median: 10000000, rent_median: 30000, psf: 8000 },
      '3': { buy_median: 15000000, rent_median: 45000, psf: 9000 },
    }
    const y = grossYield(prices)
    expect(y).not.toBeNull()
    expect(Math.round(y! * 10) / 10).toBe(3.6)

    const rent = lowestRent(prices)
    expect(rent).toBe(30000)
  })

  it('fetchSocieties maps rent price sort to sort=rent and serializes bhk array', async () => {
    let requestedUrl = ''
    globalThis.fetch = mock((url: string | URL | Request) => {
      requestedUrl = String(url)
      return Promise.resolve(new Response(JSON.stringify({ societies: [], total: 0, limit: 20, offset: 0 })))
    }) as any

    await fetchSocieties({
      city: 'pune',
      mode: 'rent',
      sort: 'price',
      bhk: [2, 3],
      ready: true,
      limit: 20,
    })

    expect(requestedUrl).toContain('city=pune')
    expect(requestedUrl).toContain('mode=rent')
    expect(requestedUrl).toContain('sort=rent')
    expect(requestedUrl).toContain('bhk=2%2C3')
    expect(requestedUrl).toContain('ready=true')
  })
})
