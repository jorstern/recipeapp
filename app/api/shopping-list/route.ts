import { NextRequest, NextResponse } from 'next/server'
import { db, generateId } from '@/lib/db'
import { ShoppingListItem } from '@/lib/types'

export async function GET() {
  const items = Array.from(db.shoppingListItems.values())
  return NextResponse.json({ success: true, data: items })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, quantityValue, quantityUnit, sourceRecipeId } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      )
    }

    const item: ShoppingListItem = {
      id: generateId(),
      name,
      quantityValue,
      quantityUnit,
      checked: false,
      sourceRecipeId,
    }

    db.shoppingListItems.set(item.id, item)

    return NextResponse.json({ success: true, data: item })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    )
  }
}