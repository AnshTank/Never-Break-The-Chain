export function clearAllCaches(): void {
  try {
    // Clear all progress-related caches
    localStorage.removeItem('progressCache')
    localStorage.removeItem('trackedDays')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('rememberMe')
    
    // Clear any other app-specific data
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.startsWith('journey-') || key.startsWith('mnzd-'))) {
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key))
    
    console.log('All caches cleared')
  } catch (error) {
    console.error('Error clearing caches:', error)
  }
}

export function clearProgressCaches(): void {
  try {
    localStorage.removeItem('progressCache')
    localStorage.removeItem('trackedDays')
    console.log('Progress caches cleared')
  } catch (error) {
    console.error('Error clearing progress caches:', error)
  }
}