import { NextRequest, NextResponse } from 'next/server'
import { db, generateId } from '@/lib/db'
import { CookTimer } from '@/lib/types'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { stepIndex, label, durationSeconds } = body
    
    const session = db.cookSessions.get(params.id)

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Cook session not found' },
        { status: 404 }
      )
    }

    const timer: CookTimer = {
      id: generateId(),
      stepIndex,
      label,
      targetEndTime: new Date(Date.now() + durationSeconds * 1000),
    }

    session.timers.push(timer)
    db.cookSessions.set(params.id, session)

    return NextResponse.json({ success: true, data: timer })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    )
  }
}