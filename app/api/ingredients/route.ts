import { NextRequest, NextResponse } from 'next/server'
import { db, generateId } from '@/lib/db'
import { Ingredient } from '@/lib/types'

export async function GET() {
  const ingredients = Array.from(db.ingredients.values())
  return NextResponse.json({ success: true, data: ingredients })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, quantityValue, quantityUnit, category, notes } = body

    if (!name || quantityValue === undefined || !quantityUnit) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const ingredient: Ingredient = {
      id: generateId(),
      name,
      quantityValue,
      quantityUnit,
      category,
      notes,
      updatedAt: new Date(),
    }

    db.ingredients.set(ingredient.id, ingredient)

    return NextResponse.json({ success: true, data: ingredient })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    )
  }
}