import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const recipe = db.recipes.get(params.id)
  
  if (!recipe) {
    return NextResponse.json(
      { success: false, error: 'Recipe not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({ success: true, data: recipe })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const deleted = db.recipes.delete(params.id)
  
  if (!deleted) {
    return NextResponse.json(
      { success: false, error: 'Recipe not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({ success: true })
}