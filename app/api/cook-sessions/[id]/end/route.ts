import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = db.cookSessions.get(params.id)

  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Cook session not found' },
      { status: 404 }
    )
  }

  session.status = 'completed'
  db.cookSessions.set(params.id, session)

  return NextResponse.json({ success: true, data: session })
}