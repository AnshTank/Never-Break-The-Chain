'use client'

import { usePathname } from 'next/navigation'
import Footer from '../components/footer'

export default function ConditionalFooter() {
  const pathname = usePathname()
  const isWelcomePage = pathname === '/welcome'

  if (isWelcomePage) return null
  return <Footer />
}