// Global request interceptor to handle device removal
export class RequestInterceptor {
  private static initialized = false;

  static initialize() {
    if (this.initialized || typeof window === 'undefined') return;
    
    // Intercept fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        // Check if device was removed
        if (response.status === 401) {
          const data = await response.clone().json().catch(() => ({}));
          if (data.forceLogout || data.error === 'Device no longer authorized') {
            console.log('Device removed - forcing logout');
            // Clear all local storage and cookies
            localStorage.clear();
            sessionStorage.clear();
            
            // Clear cookies
            document.cookie.split(";").forEach(cookie => {
              const eqPos = cookie.indexOf("=");
              const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
              document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
            });
            
            // Redirect to login
            window.location.href = '/login?message=Device removed';
            return response;
          }
        }
        
        return response;
      } catch (error) {
        console.error('Request interceptor error:', error);
        throw error;
      }
    };
    
    this.initialized = true;
    console.log('Request interceptor initialized');
  }
  
  static cleanup() {
    this.initialized = false;
  }
}