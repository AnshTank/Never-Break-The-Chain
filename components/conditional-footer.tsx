'use client'

import { usePathname } from 'next/navigation'
import Footer from '../components/footer'

export default function ConditionalFooter() {
  const pathname = usePathname()
  const authPages = ['/welcome', '/login', '/signup', '/forgot-password']
  const isAuthPage = authPages.includes(pathname)

  if (isAuthPage) return null
  return <Footer />
}