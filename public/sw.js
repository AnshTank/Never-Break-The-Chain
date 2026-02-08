// Enhanced Service Worker for Advanced Push Notifications and PWA Caching
const CACHE_NAME = 'never-break-chain-v1';
const urlsToCache = [
  '/',
  '/dashboard',
  '/manifest.json',
  '/favicon.svg',
  '/apple-touch-icon.png'
];

// Enhanced install event with caching
self.addEventListener('install', function(event) {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Enhanced activate event with cache cleanup
self.addEventListener('activate', function(event) {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => clients.claim())
  );
});

// Fetch event with cache-first strategy for static assets
self.addEventListener('fetch', function(event) {
  // Skip caching for API calls
  if (event.request.url.includes('/api/')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // Clone the request
        const fetchRequest = event.request.clone();
        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          // Clone the response
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          return response;
        });
      })
  );
});

self.addEventListener('push', function(event) {
  console.log('Push notification received:', event);
  
  if (event.data) {
    try {
      const data = event.data.json();
      console.log('Push data:', data);
      
      const options = {
        body: data.body,
        icon: data.icon || '/favicon.svg',
        badge: data.badge || '/favicon.svg',
        tag: data.tag || 'chain-reminder',
        requireInteraction: data.requireInteraction || false,
        silent: false,
        vibrate: [200, 100, 200],
        data: data.data || { url: '/dashboard' },
        actions: data.actions || [
          {
            action: 'open',
            title: 'Open App',
            icon: '/favicon.svg'
          },
          {
            action: 'dismiss', 
            title: 'Dismiss'
          }
        ]
      };

      // Add special handling for milestone notifications
      if (data.tag === 'milestone-celebration') {
        options.requireInteraction = true;
        options.vibrate = [300, 100, 300, 100, 300];
        options.actions = [
          {
            action: 'celebrate',
            title: '🎉 Celebrate!',
            icon: '/favicon.svg'
          },
          {
            action: 'share',
            title: '📱 Share Achievement',
            icon: '/favicon.svg'
          },
          {
            action: 'open',
            title: '💪 Continue Journey',
            icon: '/favicon.svg'
          }
        ];
      }

      event.waitUntil(
        self.registration.showNotification(data.title, options)
      );
    } catch (error) {
      console.error('Error parsing push data:', error);
      
      // Fallback notification
      event.waitUntil(
        self.registration.showNotification('🔗 Never Break The Chain', {
          body: 'Your journey continues! Check your progress!',
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          tag: 'fallback-notification',
          data: { url: '/dashboard' }
        })
      );
    }
  }
});

self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  const action = event.action;
  const data = event.notification.data || {};
  
  if (action === 'celebrate') {
    // Handle celebration action
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(function(clientList) {
          // If app is already open, focus it and navigate
          for (let client of clientList) {
            if (client.url.includes('/dashboard')) {
              client.focus();
              client.postMessage({ 
                type: 'CELEBRATION_TRIGGERED',
                milestone: data.milestone,
                celebrationType: data.celebrationType
              });
              return;
            }
          }
          // If app is not open, open it
          return clients.openWindow('/dashboard?celebrate=true&milestone=' + (data.milestone || ''));
        })
    );
  } else if (action === 'share') {
    // Handle share action
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(function(clientList) {
          const shareData = {
            title: '🔗 Never Break The Chain Achievement!',
            text: `I just achieved a ${data.milestone || 'major'} milestone in my MNZD journey! 🎉`,
            url: 'https://never-break-the-chain.vercel.app'
          };
          
          for (let client of clientList) {
            if (client.url.includes('/dashboard')) {
              client.focus();
              client.postMessage({ 
                type: 'SHARE_ACHIEVEMENT',
                shareData: shareData
              });
              return;
            }
          }
          return clients.openWindow('/dashboard?share=true');
        })
    );
  } else if (action === 'open' || !action) {
    // Default open action
    const targetUrl = data.url || '/dashboard';
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(function(clientList) {
          // Check if app is already open
          for (let client of clientList) {
            if (client.url.includes(targetUrl.split('?')[0])) {
              client.focus();
              return client.navigate(targetUrl);
            }
          }
          // If not open, open new window
          return clients.openWindow(targetUrl);
        })
    );
  }
  // 'dismiss' action just closes the notification (default behavior)
});

// Handle notification close events
self.addEventListener('notificationclose', function(event) {
  console.log('Notification closed:', event.notification.tag);
  
  // Track notification dismissals for analytics
  const data = event.notification.data || {};
  if (data.type) {
    // Could send analytics data here
    console.log(`Notification dismissed: ${data.type}`);
  }
});

// Enhanced install event with caching
self.addEventListener('install', function(event) {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Enhanced activate event with cache cleanup
self.addEventListener('activate', function(event) {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => clients.claim())
  );
});

// Handle messages from the main app
self.addEventListener('message', function(event) {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: '2.0.0' });
  }
});