import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const session = db.cookSessions.get(params.id)

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Cook session not found' },
        { status: 404 }
      )
    }

    const updatedSession = {
      ...session,
      ...body,
    }

    db.cookSessions.set(params.id, updatedSession)

    return NextResponse.json({ success: true, data: updatedSession })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    )
  }
}