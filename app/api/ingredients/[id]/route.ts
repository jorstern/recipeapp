import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const ingredient = db.ingredients.get(params.id)

    if (!ingredient) {
      return NextResponse.json(
        { success: false, error: 'Ingredient not found' },
        { status: 404 }
      )
    }

    const updatedIngredient = {
      ...ingredient,
      ...body,
      updatedAt: new Date(),
    }

    db.ingredients.set(params.id, updatedIngredient)

    return NextResponse.json({ success: true, data: updatedIngredient })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const deleted = db.ingredients.delete(params.id)
  
  if (!deleted) {
    return NextResponse.json(
      { success: false, error: 'Ingredient not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({ success: true })
}