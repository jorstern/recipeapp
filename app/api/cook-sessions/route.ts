import { NextRequest, NextResponse } from 'next/server'
import { db, generateId } from '@/lib/db'
import { CookSession } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recipeId, servings } = body

    if (!recipeId || !servings) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // End any active sessions
    for (const session of db.cookSessions.values()) {
      if (session.status === 'active') {
        session.status = 'aborted'
      }
    }

    const cookSession: CookSession = {
      id: generateId(),
      recipeId,
      servings,
      startedAt: new Date(),
      currentStepIndex: 1,
      timers: [],
      status: 'active',
    }

    db.cookSessions.set(cookSession.id, cookSession)

    return NextResponse.json({ success: true, data: cookSession })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    )
  }
}