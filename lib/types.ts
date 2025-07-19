export interface User {
  id: string
  name: string
}

export interface Ingredient {
  id: string
  name: string
  category?: string
  quantityValue: number
  quantityUnit: string
  notes?: string
  updatedAt: Date
}

export interface Recipe {
  id: string
  title: string
  description: string
  ingredients: RecipeIngredient[]
  steps: Step[]
  tags?: string[]
  baseServings: number
  createdAt: Date
  updatedAt: Date
  sourceUrl?: string
}

export interface RecipeIngredient {
  ingredientName: string
  canonicalIngredientId?: string
  amountValue?: number
  amountUnit?: string
  notes?: string
}

export interface Step {
  index: number
  text: string
  estimatedMinutes?: number
  timerSuggestionSeconds?: number
}

export interface CookSession {
  id: string
  recipeId: string
  startedAt: Date
  servings: number
  currentStepIndex: number
  timers: CookTimer[]
  status: 'active' | 'completed' | 'aborted'
}

export interface CookTimer {
  id: string
  stepIndex: number
  label: string
  targetEndTime: Date
  remainingSeconds?: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'ai' | 'system' | 'action'
  content: string
  createdAt: Date
  actionType?: 'OPEN_RECIPE' | 'LIST_FEASIBLE' | 'SCALE_RECIPE' | 'ADD_TO_SHOPPING_LIST' | 'START_COOK_SESSION' | 'MISSING_INGREDIENTS' | 'BASIC_SUBSTITUTIONS'
  actionPayload?: any
}

export interface ShoppingListItem {
  id: string
  name: string
  quantityValue?: number
  quantityUnit?: string
  checked: boolean
  sourceRecipeId?: string
}