import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.redirect('/login')
}

export async function POST() {
  return NextResponse.redirect('/login')
}