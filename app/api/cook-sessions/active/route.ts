import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const activeSession = Array.from(db.cookSessions.values()).find(
    session => session.status === 'active'
  )
  
  return NextResponse.json({ 
    success: true, 
    data: activeSession || null 
  })
}