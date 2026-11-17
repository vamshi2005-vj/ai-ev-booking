export function parseEventImages(imageUrl) {
  if (!imageUrl) return []
  if (typeof imageUrl === 'string' && imageUrl.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(imageUrl)
      if (Array.isArray(parsed)) {
        return parsed.filter((img) => typeof img === 'string' && img.trim().length > 0)
      }
    } catch (_) {}
  }
  return typeof imageUrl === 'string' && imageUrl.trim().length > 0 ? [imageUrl] : []
}

