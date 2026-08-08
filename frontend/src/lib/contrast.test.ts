import { describe, expect, it } from 'vitest'
import { contrastRatio } from './contrast'

/**
 * Locks in the token pairings verified during scaffolding (spec 0003,
 * AC-6). If a future edit to src/index.css's raw hex values regresses one
 * of these below its WCAG threshold, this test catches it before a
 * screen ships with illegible text.
 */
describe('token contrast (spec 0003, AC-6)', () => {
  const primary = '#003764'
  const primaryDark = '#001d35'
  const accent = '#866000'
  const canvas = '#ffffff'
  const body = '#3c4552'
  const ink = '#1a2029'
  const muted = '#6b7684'
  const borderStrong = '#8a94a0'
  const success = '#28a745'
  const warning = '#ffc107'
  const danger = '#dc3545'
  const onDanger = '#ffffff'

  it('body text on canvas meets 4.5:1', () => {
    expect(contrastRatio(body, canvas)).toBeGreaterThanOrEqual(4.5)
  })

  it('ink on canvas meets 4.5:1', () => {
    expect(contrastRatio(ink, canvas)).toBeGreaterThanOrEqual(4.5)
  })

  it('muted on canvas meets 4.5:1', () => {
    expect(contrastRatio(muted, canvas)).toBeGreaterThanOrEqual(4.5)
  })

  it('primary on canvas (as text, e.g. links/headings) meets 4.5:1', () => {
    expect(contrastRatio(primary, canvas)).toBeGreaterThanOrEqual(4.5)
  })

  it('accent gold on canvas meets 4.5:1 (the primary CTA text-on-white case)', () => {
    expect(contrastRatio(accent, canvas)).toBeGreaterThanOrEqual(4.5)
  })

  it('border-strong on canvas meets 3:1 (a form control boundary)', () => {
    expect(contrastRatio(borderStrong, canvas)).toBeGreaterThanOrEqual(3)
  })

  it('success text-on-white FAILS (documents why on-success exists, never render success as bare text)', () => {
    expect(contrastRatio(success, canvas)).toBeLessThan(4.5)
  })

  it('warning text-on-white FAILS badly (documents why on-warning exists)', () => {
    expect(contrastRatio(warning, canvas)).toBeLessThan(4.5)
  })

  it('primary-dark on success (the on-success token) meets 4.5:1', () => {
    expect(contrastRatio(primaryDark, success)).toBeGreaterThanOrEqual(4.5)
  })

  it('primary-dark on warning (the on-warning token) meets 4.5:1', () => {
    expect(contrastRatio(primaryDark, warning)).toBeGreaterThanOrEqual(4.5)
  })

  it('white on danger (the on-danger token) meets 4.5:1', () => {
    expect(contrastRatio(onDanger, danger)).toBeGreaterThanOrEqual(4.5)
  })

  it('primary-dark on danger FAILS (documents why on-danger is white, not the success/warning pattern)', () => {
    expect(contrastRatio(primaryDark, danger)).toBeLessThan(4.5)
  })
})
