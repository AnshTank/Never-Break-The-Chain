'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import HomePage from '@/components/pages/HomePage'
import Head from 'next/head'

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
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "What is the MNZD methodology by Ansh Tank?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "MNZD is a comprehensive habit tracking methodology created by Ansh Tank focusing on four pillars: Meditation (mindfulness and mental clarity), Nutrition (healthy eating and learning), Zone (physical exercise and movement), and Discipline (focused work and productivity). This system helps build consistent daily habits for personal transformation."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How does Never Break The Chain habit tracker work?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Never Break The Chain by Ansh Tank uses Jerry Seinfeld's 'Don't Break the Chain' method. You track your daily habits across the four MNZD pillars, building streaks and maintaining consistency. The app provides visual progress tracking, analytics, and smart notifications to help you maintain your habit chains."
                  }
                }
              ]
            })
          }}
        />
      </Head>
      <div className="min-h-screen bg-white">
        <Navigation isScrolled={isScrolled} />
        <HomePage />
      </div>
    </>
  )
}
