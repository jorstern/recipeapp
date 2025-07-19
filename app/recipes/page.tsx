'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRecipes } from '@/lib/hooks'
import { useStore } from '@/lib/store'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Modal from '@/components/Modal'
import DataFetchBoundary from '@/components/DataFetchBoundary'
import { Recipe } from '@/lib/types'

export default function RecipesPage() {
  const router = useRouter()
  const { recipes, loading, error } = useRecipes()
  const { setRecipes, showToast } = useStore()
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newRecipe, setNewRecipe] = useState({
    title: '',
    description: '',
    baseServings: 4,
    ingredients: '',
    steps: '',
    tags: '',
  })

  const filteredRecipes = recipes.filter(recipe =>
    recipe.title.toLowerCase().includes(search.toLowerCase()) ||
    recipe.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  )

  const handleAddRecipe = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newRecipe.title.trim() || !newRecipe.ingredients.trim() || !newRecipe.steps.trim()) {
      showToast('Please fill in all required fields', 'error')
      return
    }

    try {
      const ingredientLines = newRecipe.ingredients.split('\n').filter(line => line.trim())
      const stepLines = newRecipe.steps.split('\n').filter(line => line.trim())
      
      const recipeData = {
        title: newRecipe.title,
        description: newRecipe.description,
        baseServings: newRecipe.baseServings,
        ingredients: ingredientLines.map((line, index) => {
          const parts = line.split(' ')
          const amount = parseFloat(parts[0])
          const unit = parts[1]
          const name = parts.slice(isNaN(amount) ? 0 : 2).join(' ')
          
          return {
            ingredientName: isNaN(amount) ? line : name,
            amountValue: isNaN(amount) ? undefined : amount,
            amountUnit: isNaN(amount) ? undefined : unit,
          }
        }),
        steps: stepLines.map((text, index) => ({
          index: index + 1,
          text,
        })),
        tags: newRecipe.tags ? newRecipe.tags.split(',').map(t => t.trim()) : [],
      }

      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipeData),
      })

      const data = await response.json()

      if (data.success) {
        setRecipes([...recipes, data.data])
        setShowAddModal(false)
        setNewRecipe({
          title: '',
          description: '',
          baseServings: 4,
          ingredients: '',
          steps: '',
          tags: '',
        })
        showToast('Recipe added successfully!', 'success')
      } else {
        showToast('Failed to add recipe', 'error')
      }
    } catch (error) {
      showToast('Error adding recipe', 'error')
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Recipe Library</h1>
        <Button onClick={() => setShowAddModal(true)}>
          Add Recipe
        </Button>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search recipes or tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <DataFetchBoundary loading={loading} error={error}>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push(`/recipes/${recipe.id}`)}
            >
              <h3 className="text-xl font-semibold mb-2">{recipe.title}</h3>
              {recipe.description && (
                <p className="text-gray-600 mb-3">{recipe.description}</p>
              )}
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Serves {recipe.baseServings}</span>
                {recipe.tags && recipe.tags.length > 0 && (
                  <span>{recipe.tags[0]}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredRecipes.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            <p>No recipes found.</p>
          </div>
        )}
      </DataFetchBoundary>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Recipe"
      >
        <form onSubmit={handleAddRecipe} className="space-y-4">
          <Input
            label="Title *"
            value={newRecipe.title}
            onChange={(e) => setNewRecipe({ ...newRecipe, title: e.target.value })}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={2}
              value={newRecipe.description}
              onChange={(e) => setNewRecipe({ ...newRecipe, description: e.target.value })}
            />
          </div>

          <Input
            label="Base Servings"
            type="number"
            min="1"
            value={newRecipe.baseServings}
            onChange={(e) => setNewRecipe({ ...newRecipe, baseServings: parseInt(e.target.value) })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ingredients * (one per line, e.g., "2 cups flour")
            </label>
            <textarea
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={4}
              value={newRecipe.ingredients}
              onChange={(e) => setNewRecipe({ ...newRecipe, ingredients: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Steps * (one per line)
            </label>
            <textarea
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={4}
              value={newRecipe.steps}
              onChange={(e) => setNewRecipe({ ...newRecipe, steps: e.target.value })}
              required
            />
          </div>

          <Input
            label="Tags (comma-separated)"
            value={newRecipe.tags}
            onChange={(e) => setNewRecipe({ ...newRecipe, tags: e.target.value })}
            placeholder="italian, pasta, dinner"
          />

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Add Recipe
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}