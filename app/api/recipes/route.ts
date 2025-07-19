import { NextRequest, NextResponse } from 'next/server'
import { db, generateId } from '@/lib/db'
import { Recipe } from '@/lib/types'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const search = searchParams.get('search')
  
  let recipes = Array.from(db.recipes.values())
  
  if (search) {
    const searchLower = search.toLowerCase()
    recipes = recipes.filter(recipe => 
      recipe.title.toLowerCase().includes(searchLower) ||
      recipe.tags?.some(tag => tag.toLowerCase().includes(searchLower))
    )
  }
  
  return NextResponse.json({ success: true, data: recipes })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, baseServings, description, ingredients, steps, tags, sourceUrl } = body

    if (!title || !baseServings || !ingredients || !steps) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const recipe: Recipe = {
      id: generateId(),
      title,
      description,
      baseServings,
      ingredients,
      steps,
      tags,
      sourceUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    db.recipes.set(recipe.id, recipe)

    return NextResponse.json({ success: true, data: recipe })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    )
  }
}