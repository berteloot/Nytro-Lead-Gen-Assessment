/**
 * Safe JSON parsing utilities to prevent client-side crashes
 */

export const safeParse = <T>(s: string | null): T | null => {
  try {
    return s ? JSON.parse(s) as T : null
  } catch {
    return null
  }
}

export const safeParseArray = <T>(s: string | null): T[] => {
  try {
    if (!s) return []
    const parsed = JSON.parse(s)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const safeParseObject = <T>(s: string | null, fallback: T): T => {
  try {
    if (!s) return fallback
    const parsed = JSON.parse(s)
    return typeof parsed === 'object' && parsed !== null ? parsed : fallback
  } catch {
    return fallback
  }
}
