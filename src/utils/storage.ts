export function loadSavedData<T>(key: string, fallback: T): T {
  const saved = localStorage.getItem(key)

  if (!saved) return fallback

  try {
    return JSON.parse(saved)
  } catch {
    return fallback
  }
}