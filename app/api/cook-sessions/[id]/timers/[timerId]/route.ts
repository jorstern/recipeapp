import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; timerId: string } }
) {
  const session = db.cookSessions.get(params.id)

  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Cook session not found' },
      { status: 404 }
    )
  }

  const timerIndex = session.timers.findIndex(t => t.id === params.timerId)
  
  if (timerIndex === -1) {
    return NextResponse.json(
      { success: false, error: 'Timer not found' },
      { status: 404 }
    )
  }

  session.timers.splice(timerIndex, 1)
  db.cookSessions.set(params.id, session)

  return NextResponse.json({ success: true })
}