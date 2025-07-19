'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { useIngredients } from '@/lib/hooks'
import Button from '@/components/Button'
import Input from '@/components/Input'
import DataFetchBoundary from '@/components/DataFetchBoundary'
import { Recipe } from '@/lib/types'

interface RecipeDetailPageProps {
  params: { id: string }
}

export default function RecipeDetailPage({ params }: RecipeDetailPageProps) {
  const router = useRouter()
  const { showToast, setActiveSession } = useStore()
  const { ingredients } = useIngredients()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [scaledServings, setScaledServings] = useState(4)
  
  useEffect(() => {
    fetch(`/api/recipes/${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRecipe(data.data)
          setScaledServings(data.data.baseServings)
        } else {
          setError(new Error('Recipe not found'))
        }
      })
      .catch(err => setError(err))
      .finally(() => setLoading(false))
  }, [params.id])
  
  const scaleFactor = recipe ? scaledServings / recipe.baseServings : 1
  
  const getMissingIngredients = () => {
    if (!recipe) return []
    
    return recipe.ingredients.filter(recipeIng => {
      if (!recipeIng.amountValue) return false
      
      const availableIng = ingredients.find(ing => 
        ing.name.toLowerCase() === recipeIng.ingredientName.toLowerCase()
      )
      
      if (!availableIng) return true
      
      const neededAmount = recipeIng.amountValue * scaleFactor
      return availableIng.quantityValue < neededAmount
    })
  }
  
  const missingIngredients = getMissingIngredients()
  
  const handleStartCooking = async () => {
    if (!recipe) return
    
    try {
      const response = await fetch('/api/cook-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeId: recipe.id,
          servings: scaledServings,
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setActiveSession(data.data)
        showToast('Cook session started!', 'success')
        router.push('/cook')
      } else {
        showToast('Failed to start cooking session', 'error')
      }
    } catch (error) {
      showToast('Error starting cooking session', 'error')
    }
  }
  
  const handleAddMissingToList = async () => {
    if (!recipe || missingIngredients.length === 0) return
    
    try {
      const promises = missingIngredients.map(async (ing) => {
        const scaledAmount = ing.amountValue ? ing.amountValue * scaleFactor : null
        
        return fetch('/api/shopping-list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: ing.ingredientName,
            quantityValue: scaledAmount,
            quantityUnit: ing.amountUnit,
            sourceRecipeId: recipe.id,
          }),
        })
      })
      
      await Promise.all(promises)
      showToast(`Added ${missingIngredients.length} items to shopping list`, 'success')
    } catch (error) {
      showToast('Error adding items to shopping list', 'error')
    }
  }
  
  return (
    <DataFetchBoundary loading={loading} error={error}>
      {recipe && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{recipe.title}</h1>
                {recipe.description && (
                  <p className="text-gray-600">{recipe.description}</p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Servings:</label>
                  <Input
                    type="number"
                    min="1"
                    value={scaledServings}
                    onChange={(e) => setScaledServings(parseInt(e.target.value) || 1)}
                    className="w-20"
                  />
                </div>
                <Button onClick={handleStartCooking}>
                  Start Cooking
                </Button>
              </div>
            </div>
            
            {missingIngredients.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-red-800">Missing Ingredients</h3>
                    <p className="text-sm text-red-600">
                      You're missing {missingIngredients.length} ingredients for this recipe.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleAddMissingToList}
                  >
                    Add to Shopping List
                  </Button>
                </div>
              </div>
            )}
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Ingredients</h2>
                <ul className="space-y-2">
                  {recipe.ingredients.map((ingredient, index) => {
                    const scaledAmount = ingredient.amountValue 
                      ? ingredient.amountValue * scaleFactor 
                      : null
                    
                    const isMissing = missingIngredients.some(
                      missing => missing.ingredientName === ingredient.ingredientName
                    )
                    
                    return (
                      <li
                        key={index}
                        className={`flex justify-between items-center p-2 rounded ${
                          isMissing ? 'bg-red-50 text-red-700' : 'hover:bg-gray-50'
                        }`}
                      >
                        <span>{ingredient.ingredientName}</span>
                        <span className="text-sm text-gray-600">
                          {scaledAmount && ingredient.amountUnit
                            ? `${scaledAmount.toFixed(1)} ${ingredient.amountUnit}`
                            : 'To taste'}
                          {ingredient.notes && ` (${ingredient.notes})`}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4">Instructions</h2>
                <ol className="space-y-4">
                  {recipe.steps.map((step, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                        {step.index}
                      </span>
                      <div>
                        <p>{step.text}</p>
                        {step.estimatedMinutes && (
                          <p className="text-sm text-gray-500 mt-1">
                            ~{step.estimatedMinutes} minutes
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            
            {recipe.tags && recipe.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Tags:</span>
                  {recipe.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DataFetchBoundary>
  )
}