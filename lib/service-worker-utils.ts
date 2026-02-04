// Service Worker Registration Utility
// Handles Vercel deployment issues with service worker registration

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker not supported')
    return null
  }

  try {
    // First, try direct registration
    console.log('Attempting direct service worker registration...')
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    })
    console.log('Service worker registered successfully:', registration)
    return registration
  } catch (directError) {
    console.warn('Direct registration failed, trying API fallback:', directError)
    
    try {
      // Fallback: Get service worker content from API route
      const swResponse = await fetch('/api/sw')
      if (!swResponse.ok) {
        throw new Error(`API route failed: ${swResponse.status}`)
      }
      
      const swContent = await swResponse.text()
      const blob = new Blob([swContent], { type: 'application/javascript' })
      const swUrl = URL.createObjectURL(blob)
      
      const registration = await navigator.serviceWorker.register(swUrl, {
        scope: '/'
      })
      
      // Clean up the blob URL
      URL.revokeObjectURL(swUrl)
      
      console.log('Service worker registered via API fallback:', registration)
      return registration
    } catch (fallbackError) {
      console.error('Service worker registration failed completely:', fallbackError)
      return null
    }
  }
}

export async function subscribeToPushNotifications(
  registration: ServiceWorkerRegistration,
  vapidPublicKey?: string
): Promise<PushSubscription | null> {
  try {
    if (!vapidPublicKey) {
      console.warn('VAPID public key not provided')
      return null
    }

    await navigator.serviceWorker.ready
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidPublicKey
    })
    
    console.log('Push subscription created:', subscription)
    return subscription
  } catch (error) {
    console.error('Push subscription failed:', error)
    return null
  }
}