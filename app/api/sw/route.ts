import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET(request: NextRequest) {
  try {
    const swPath = join(process.cwd(), 'public', 'sw.js')
    const swContent = readFileSync(swPath, 'utf8')
    
    return new NextResponse(swContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Service-Worker-Allowed': '/',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('Error serving service worker:', error)
    return new NextResponse('Service Worker not found', { status: 404 })
  }
}