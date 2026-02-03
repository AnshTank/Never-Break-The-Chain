'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import HomePage from '@/components/pages/HomePage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ansh Tank - Habit Tracker App | Never Break The Chain | Parul University Student Project',
  description: 'Ansh Tank from Parul University presents Never Break The Chain - a professional habit tracking app built with Next.js, TypeScript & MongoDB. Track MNZD habits: Meditation, Nutrition, Zone, Discipline. Free habit tracker by Ansh Tank.',
  keywords: 'Ansh Tank, Ansh Tank Parul University, Ansh Tank habit tracker, Ansh Tank project, Ansh Tank github, Ansh Tank developer, Parul University student, habit tracker app, MNZD methodology, Never Break The Chain, free habit tracker',
  openGraph: {
    title: 'Ansh Tank - Professional Habit Tracker | Never Break The Chain',
    description: 'Ansh Tank from Parul University created this advanced habit tracking app. Track daily habits with MNZD methodology. Built with Next.js & TypeScript.',
  }
}

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false)
  const router = useRouter()

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
