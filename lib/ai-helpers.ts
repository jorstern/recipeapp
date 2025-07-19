import { db } from './db'
import { Recipe, Ingredient, ChatMessage } from './types'

export function calculateFeasibleRecipes(targetServings?: number) {
  const recipes = Array.from(db.recipes.values())
  const ingredients = Array.from(db.ingredients.values())
  
  const feasibleRecipes = recipes.filter(recipe => {
    const servings = targetServings || recipe.baseServings
    const scaleFactor = servings / recipe.baseServings
    
    return recipe.ingredients.every(recipeIng => {
      if (!recipeIng.amountValue) return true // Unquantified ingredients don't block
      
      const availableIng = ingredients.find(ing => 
        ing.id === recipeIng.canonicalIngredientId ||
        ing.name.toLowerCase() === recipeIng.ingredientName.toLowerCase()
      )
      
      if (!availableIng) return false
      
      const neededAmount = recipeIng.amountValue * scaleFactor
      return availableIng.quantityValue >= neededAmount
    })
  })
  
  return feasibleRecipes
}

export function calculateMissingIngredients(recipeId: string, targetServings: number) {
  const recipe = db.recipes.get(recipeId)
  if (!recipe) return []
  
  const ingredients = Array.from(db.ingredients.values())
  const scaleFactor = targetServings / recipe.baseServings
  const missing: Array<{
    name: string
    neededAmount: number
    neededUnit: string
    availableAmount: number
  }> = []
  
  recipe.ingredients.forEach(recipeIng => {
    if (!recipeIng.amountValue) return
    
    const availableIng = ingredients.find(ing => 
      ing.id === recipeIng.canonicalIngredientId ||
      ing.name.toLowerCase() === recipeIng.ingredientName.toLowerCase()
    )
    
    const neededAmount = recipeIng.amountValue * scaleFactor
    const availableAmount = availableIng?.quantityValue || 0
    
    if (availableAmount < neededAmount) {
      missing.push({
        name: recipeIng.ingredientName,
        neededAmount: neededAmount - availableAmount,
        neededUnit: recipeIng.amountUnit || '',
        availableAmount,
      })
    }
  })
  
  return missing
}

export function parseIntent(message: string): {
  intent: ChatMessage['actionType'] | 'NONE'
  params?: any
} {
  const lower = message.toLowerCase()
  
  // Pattern matching for intents
  if (lower.includes('what can i cook') || lower.includes('what can i make') || lower.includes('feasible')) {
    return { intent: 'LIST_FEASIBLE' }
  }
  
  if (lower.includes('start cooking') || lower.includes('start cook')) {
    const recipeMatch = message.match(/recipe\s+(\w+)/i)
    return { intent: 'START_COOK_SESSION', params: { recipeId: recipeMatch?.[1] } }
  }
  
  if (lower.includes('scale') && lower.includes('serving')) {
    const servingsMatch = message.match(/(\d+)\s*servings?/i)
    return { intent: 'SCALE_RECIPE', params: { servings: servingsMatch?.[1] ? parseInt(servingsMatch[1]) : null } }
  }
  
  if (lower.includes('missing ingredient')) {
    return { intent: 'MISSING_INGREDIENTS' }
  }
  
  if (lower.includes('add') && lower.includes('shopping list')) {
    return { intent: 'ADD_TO_SHOPPING_LIST' }
  }
  
  if (lower.includes('open recipe') || lower.includes('show recipe')) {
    return { intent: 'OPEN_RECIPE' }
  }
  
  if (lower.includes('substitute') || lower.includes('replacement')) {
    return { intent: 'BASIC_SUBSTITUTIONS' }
  }
  
  return { intent: 'NONE' }
}

export function formatScaledIngredients(recipe: Recipe, targetServings: number) {
  const scaleFactor = targetServings / recipe.baseServings
  
  return recipe.ingredients.map(ing => ({
    ...ing,
    scaledAmount: ing.amountValue ? ing.amountValue * scaleFactor : null,
  }))
}