import { NextRequest, NextResponse } from 'next/server'
import { db, generateId } from '@/lib/db'
import { ChatMessage } from '@/lib/types'
import { 
  parseIntent, 
  calculateFeasibleRecipes, 
  calculateMissingIngredients,
  formatScaledIngredients
} from '@/lib/ai-helpers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, newMessage } = body

    if (!newMessage) {
      return NextResponse.json(
        { success: false, error: 'New message is required' },
        { status: 400 }
      )
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: newMessage,
      createdAt: new Date(),
    }
    db.chatMessages.push(userMessage)

    // Parse intent
    const { intent, params } = parseIntent(newMessage)
    
    let aiResponse: ChatMessage

    switch (intent) {
      case 'LIST_FEASIBLE': {
        const feasible = calculateFeasibleRecipes()
        aiResponse = {
          id: generateId(),
          role: 'action',
          content: `Found ${feasible.length} recipes you can make with your current ingredients.`,
          createdAt: new Date(),
          actionType: 'LIST_FEASIBLE',
          actionPayload: feasible.map(r => ({
            id: r.id,
            title: r.title,
            description: r.description,
          })),
        }
        break
      }
      
      case 'OPEN_RECIPE': {
        const recipes = Array.from(db.recipes.values())
        const recipe = recipes[0] // For MVP, just show first recipe
        if (recipe) {
          aiResponse = {
            id: generateId(),
            role: 'action',
            content: `Here's the recipe for ${recipe.title}.`,
            createdAt: new Date(),
            actionType: 'OPEN_RECIPE',
            actionPayload: {
              id: recipe.id,
              title: recipe.title,
              description: recipe.description,
              baseServings: recipe.baseServings,
              ingredients: recipe.ingredients,
              steps: recipe.steps,
            },
          }
        } else {
          aiResponse = {
            id: generateId(),
            role: 'ai',
            content: 'No recipes found in your library.',
            createdAt: new Date(),
          }
        }
        break
      }
      
      case 'SCALE_RECIPE': {
        const recipes = Array.from(db.recipes.values())
        const recipe = recipes[0] // For MVP, just use first recipe
        const servings = params?.servings || 4
        
        if (recipe) {
          const scaledIngredients = formatScaledIngredients(recipe, servings)
          aiResponse = {
            id: generateId(),
            role: 'action',
            content: `Scaled ${recipe.title} to ${servings} servings.`,
            createdAt: new Date(),
            actionType: 'SCALE_RECIPE',
            actionPayload: {
              recipeId: recipe.id,
              title: recipe.title,
              targetServings: servings,
              ingredients: scaledIngredients,
            },
          }
        } else {
          aiResponse = {
            id: generateId(),
            role: 'ai',
            content: 'No recipe to scale.',
            createdAt: new Date(),
          }
        }
        break
      }
      
      case 'MISSING_INGREDIENTS': {
        const recipes = Array.from(db.recipes.values())
        const recipe = recipes[0]
        
        if (recipe) {
          const missing = calculateMissingIngredients(recipe.id, recipe.baseServings)
          aiResponse = {
            id: generateId(),
            role: 'action',
            content: `You're missing ${missing.length} ingredients for ${recipe.title}.`,
            createdAt: new Date(),
            actionType: 'MISSING_INGREDIENTS',
            actionPayload: {
              recipeId: recipe.id,
              recipeTitle: recipe.title,
              missing,
            },
          }
        } else {
          aiResponse = {
            id: generateId(),
            role: 'ai',
            content: 'No recipe selected.',
            createdAt: new Date(),
          }
        }
        break
      }
      
      case 'ADD_TO_SHOPPING_LIST': {
        const recipes = Array.from(db.recipes.values())
        const recipe = recipes[0]
        
        if (recipe) {
          const missing = calculateMissingIngredients(recipe.id, recipe.baseServings)
          const added: any[] = []
          
          missing.forEach(item => {
            const shoppingItem = {
              id: generateId(),
              name: item.name,
              quantityValue: item.neededAmount,
              quantityUnit: item.neededUnit,
              checked: false,
              sourceRecipeId: recipe.id,
            }
            db.shoppingListItems.set(shoppingItem.id, shoppingItem)
            added.push(shoppingItem)
          })
          
          aiResponse = {
            id: generateId(),
            role: 'action',
            content: `Added ${added.length} missing ingredients to your shopping list.`,
            createdAt: new Date(),
            actionType: 'ADD_TO_SHOPPING_LIST',
            actionPayload: { added },
          }
        } else {
          aiResponse = {
            id: generateId(),
            role: 'ai',
            content: 'No recipe selected.',
            createdAt: new Date(),
          }
        }
        break
      }
      
      case 'START_COOK_SESSION': {
        const recipes = Array.from(db.recipes.values())
        const recipe = recipes[0]
        
        if (recipe) {
          // End any active sessions
          for (const session of db.cookSessions.values()) {
            if (session.status === 'active') {
              session.status = 'aborted'
            }
          }
          
          const cookSession = {
            id: generateId(),
            recipeId: recipe.id,
            servings: recipe.baseServings,
            startedAt: new Date(),
            currentStepIndex: 1,
            timers: [],
            status: 'active' as const,
          }
          
          db.cookSessions.set(cookSession.id, cookSession)
          
          aiResponse = {
            id: generateId(),
            role: 'action',
            content: `Started cooking ${recipe.title}! Navigate to the Cook page to see your steps.`,
            createdAt: new Date(),
            actionType: 'START_COOK_SESSION',
            actionPayload: {
              sessionId: cookSession.id,
              recipeTitle: recipe.title,
            },
          }
        } else {
          aiResponse = {
            id: generateId(),
            role: 'ai',
            content: 'No recipe to start cooking.',
            createdAt: new Date(),
          }
        }
        break
      }
      
      default:
        aiResponse = {
          id: generateId(),
          role: 'ai',
          content: "I can help you with cooking! Try asking 'What can I cook?' or 'Start cooking' a recipe.",
          createdAt: new Date(),
        }
    }

    db.chatMessages.push(aiResponse)

    return NextResponse.json({ 
      success: true, 
      data: [userMessage, aiResponse] 
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    )
  }
}