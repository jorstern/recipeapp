import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const item = db.shoppingListItems.get(params.id)

    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Shopping list item not found' },
        { status: 404 }
      )
    }

    const updatedItem = {
      ...item,
      ...body,
    }

    db.shoppingListItems.set(params.id, updatedItem)

    return NextResponse.json({ success: true, data: updatedItem })
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
  const deleted = db.shoppingListItems.delete(params.id)
  
  if (!deleted) {
    return NextResponse.json(
      { success: false, error: 'Shopping list item not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({ success: true })
}