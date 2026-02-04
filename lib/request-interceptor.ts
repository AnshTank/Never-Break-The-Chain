import { useEffect } from 'react';

export function RequestInterceptor() {
  useEffect(() => {
    // Request interceptor logic
    console.log('Request interceptor initialized');
  }, []);

  return null;
}