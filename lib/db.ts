import { Ingredient, Recipe, CookSession, ChatMessage, ShoppingListItem } from './types'

// In-memory data store for MVP (will be replaced with Vercel Neon Postgres)
export const db = {
  ingredients: new Map<string, Ingredient>(),
  recipes: new Map<string, Recipe>(),
  cookSessions: new Map<string, CookSession>(),
  chatMessages: [] as ChatMessage[],
  shoppingListItems: new Map<string, ShoppingListItem>(),
}

// Helper to generate UUIDs
export function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Initialize with some sample data
function initializeData() {
  // Sample ingredients
  const sampleIngredients: Ingredient[] = [
    {
      id: generateId(),
      name: 'Pasta',
      category: 'pantry',
      quantityValue: 500,
      quantityUnit: 'g',
      updatedAt: new Date(),
    },
    {
      id: generateId(),
      name: 'Tomato Sauce',
      category: 'pantry',
      quantityValue: 2,
      quantityUnit: 'cans',
      updatedAt: new Date(),
    },
    {
      id: generateId(),
      name: 'Ground Beef',
      category: 'meat',
      quantityValue: 300,
      quantityUnit: 'g',
      updatedAt: new Date(),
    },
    {
      id: generateId(),
      name: 'Onion',
      category: 'produce',
      quantityValue: 3,
      quantityUnit: 'count',
      updatedAt: new Date(),
    },
    {
      id: generateId(),
      name: 'Garlic',
      category: 'produce',
      quantityValue: 1,
      quantityUnit: 'head',
      updatedAt: new Date(),
    },
  ]

  sampleIngredients.forEach(ing => db.ingredients.set(ing.id, ing))

  // Sample recipes
  const sampleRecipes: Recipe[] = [
    {
      id: generateId(),
      title: 'Spaghetti Bolognese',
      description: 'Classic Italian meat sauce with pasta',
      baseServings: 4,
      tags: ['italian', 'pasta', 'dinner'],
      ingredients: [
        {
          ingredientName: 'Pasta',
          canonicalIngredientId: sampleIngredients[0].id,
          amountValue: 400,
          amountUnit: 'g',
        },
        {
          ingredientName: 'Ground Beef',
          canonicalIngredientId: sampleIngredients[2].id,
          amountValue: 500,
          amountUnit: 'g',
        },
        {
          ingredientName: 'Tomato Sauce',
          canonicalIngredientId: sampleIngredients[1].id,
          amountValue: 2,
          amountUnit: 'cans',
        },
        {
          ingredientName: 'Onion',
          canonicalIngredientId: sampleIngredients[3].id,
          amountValue: 1,
          amountUnit: 'count',
          notes: 'diced',
        },
        {
          ingredientName: 'Garlic',
          canonicalIngredientId: sampleIngredients[4].id,
          amountValue: 3,
          amountUnit: 'cloves',
          notes: 'minced',
        },
      ],
      steps: [
        {
          index: 1,
          text: 'Boil water for pasta',
          estimatedMinutes: 10,
          timerSuggestionSeconds: 600,
        },
        {
          index: 2,
          text: 'Brown ground beef in a large pan',
          estimatedMinutes: 5,
        },
        {
          index: 3,
          text: 'Add diced onion and minced garlic, cook until soft',
          estimatedMinutes: 5,
        },
        {
          index: 4,
          text: 'Add tomato sauce and simmer',
          estimatedMinutes: 20,
          timerSuggestionSeconds: 1200,
        },
        {
          index: 5,
          text: 'Cook pasta according to package directions',
          estimatedMinutes: 10,
        },
        {
          index: 6,
          text: 'Drain pasta and serve with sauce',
          estimatedMinutes: 2,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  sampleRecipes.forEach(recipe => db.recipes.set(recipe.id, recipe))
}

// Initialize data on first import
if (db.ingredients.size === 0) {
  initializeData()
}