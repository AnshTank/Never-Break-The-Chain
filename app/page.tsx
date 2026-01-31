'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import HomePage from '@/components/pages/HomePage'

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false)
  const router = useRouter()

  // Check if user is authenticated and redirect to dashboard
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user', {
          method: 'GET',
          credentials: 'include'
        })
        if (response.ok) {
          // User is authenticated, redirect to dashboard
          router.replace('/dashboard')
        }
      } catch (error) {
        // User is not authenticated, stay on landing page
      }
    }
    checkAuth()
  }, [router])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Navigation isScrolled={isScrolled} />
      <HomePage />
    </div>
  )
}
