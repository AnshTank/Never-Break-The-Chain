export async function checkAuth(): Promise<{ authenticated: boolean; user?: any }> {
  try {
    const response = await fetch('/api/user/profile')
    if (response.ok) {
      const user = await response.json()
      return { authenticated: true, user }
    }
    return { authenticated: false }
  } catch (error) {
    return { authenticated: false }
  }
}

export async function logout(): Promise<void> {
  try {
    await fetch('/api/auth/logout', { method: 'POST' })
    // Clear ALL local storage data
    localStorage.clear()
    // Redirect to login
    window.location.href = '/login'
  } catch (error) {
    console.error('Logout error:', error)
    // Force clear storage and redirect even if API fails
    localStorage.clear()
    window.location.href = '/login'
  }
}