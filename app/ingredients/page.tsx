'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useIngredients } from '@/lib/hooks'
import { useStore } from '@/lib/store'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Select from '@/components/Select'
import Modal from '@/components/Modal'
import DataFetchBoundary from '@/components/DataFetchBoundary'
import { Ingredient } from '@/lib/types'

export default function IngredientsPage() {
  const router = useRouter()
  const { ingredients, loading, error } = useIngredients()
  const { setIngredients, updateIngredient, showToast } = useStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    quantityValue: 0,
    quantityUnit: '',
    category: '',
    notes: '',
  })

  const categories = [
    { value: '', label: 'No category' },
    { value: 'pantry', label: 'Pantry' },
    { value: 'produce', label: 'Produce' },
    { value: 'meat', label: 'Meat' },
    { value: 'dairy', label: 'Dairy' },
    { value: 'spices', label: 'Spices' },
  ]

  const handleAddIngredient = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newIngredient.name.trim() || !newIngredient.quantityUnit.trim()) {
      showToast('Please fill in all required fields', 'error')
      return
    }

    try {
      const response = await fetch('/api/ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIngredient),
      })

      const data = await response.json()

      if (data.success) {
        setIngredients([...ingredients, data.data])
        setShowAddModal(false)
        setNewIngredient({
          name: '',
          quantityValue: 0,
          quantityUnit: '',
          category: '',
          notes: '',
        })
        showToast('Ingredient added successfully!', 'success')
      } else {
        showToast('Failed to add ingredient', 'error')
      }
    } catch (error) {
      showToast('Error adding ingredient', 'error')
    }
  }

  const handleUpdateQuantity = async (id: string, newQuantity: number) => {
    try {
      const response = await fetch(`/api/ingredients/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantityValue: newQuantity }),
      })

      const data = await response.json()

      if (data.success) {
        updateIngredient(id, { quantityValue: newQuantity })
        setEditingId(null)
        showToast('Quantity updated', 'success')
      } else {
        showToast('Failed to update quantity', 'error')
      }
    } catch (error) {
      showToast('Error updating quantity', 'error')
    }
  }

  const handleDeleteIngredient = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ingredient?')) return

    try {
      const response = await fetch(`/api/ingredients/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        setIngredients(ingredients.filter(ing => ing.id !== id))
        showToast('Ingredient deleted', 'success')
      } else {
        showToast('Failed to delete ingredient', 'error')
      }
    } catch (error) {
      showToast('Error deleting ingredient', 'error')
    }
  }

  const handleDecrementQuantity = async (ingredient: Ingredient) => {
    const newQuantity = Math.max(0, ingredient.quantityValue - 1)
    await handleUpdateQuantity(ingredient.id, newQuantity)
  }

  const startEditingQuantity = (id: string, currentValue: number) => {
    setEditingId(id)
    setEditValue(currentValue.toString())
  }

  const saveEditedQuantity = async (id: string) => {
    const newQuantity = parseFloat(editValue)
    if (!isNaN(newQuantity) && newQuantity >= 0) {
      await handleUpdateQuantity(id, newQuantity)
    } else {
      setEditingId(null)
    }
  }

  const groupedIngredients = ingredients.reduce((groups, ingredient) => {
    const category = ingredient.category || 'Other'
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(ingredient)
    return groups
  }, {} as Record<string, Ingredient[]>)

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Ingredient Inventory</h1>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => router.push('/?action=feasible')}
          >
            What Can I Cook?
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            Add Ingredient
          </Button>
        </div>
      </div>

      <DataFetchBoundary loading={loading} error={error}>
        <div className="space-y-6">
          {Object.entries(groupedIngredients).map(([category, categoryIngredients]) => (
            <div key={category} className="bg-white rounded-lg shadow-md">
              <div className="bg-gray-50 px-6 py-3 border-b">
                <h2 className="text-lg font-semibold text-gray-800">{category}</h2>
              </div>
              <div className="p-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {categoryIngredients.map((ingredient) => (
                    <div
                      key={ingredient.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900">{ingredient.name}</h3>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeleteIngredient(ingredient.id)}
                          className="text-xs px-2 py-1"
                        >
                          ✕
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        {editingId === ingredient.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              step="0.1"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                              onBlur={() => saveEditedQuantity(ingredient.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  saveEditedQuantity(ingredient.id)
                                } else if (e.key === 'Escape') {
                                  setEditingId(null)
                                }
                              }}
                              autoFocus
                            />
                            <span className="text-sm text-gray-600">{ingredient.quantityUnit}</span>
                          </div>
                        ) : (
                          <div
                            className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded"
                            onClick={() => startEditingQuantity(ingredient.id, ingredient.quantityValue)}
                          >
                            <span className="font-medium">{ingredient.quantityValue}</span>
                            <span className="text-sm text-gray-600">{ingredient.quantityUnit}</span>
                          </div>
                        )}
                        
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleDecrementQuantity(ingredient)}
                          className="text-xs px-2 py-1"
                        >
                          -1
                        </Button>
                      </div>
                      
                      {ingredient.notes && (
                        <p className="text-sm text-gray-500">{ingredient.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {ingredients.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            <p>No ingredients in your inventory yet.</p>
            <p className="text-sm mt-1">Add some ingredients to get started!</p>
          </div>
        )}
      </DataFetchBoundary>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Ingredient"
      >
        <form onSubmit={handleAddIngredient} className="space-y-4">
          <Input
            label="Name *"
            value={newIngredient.name}
            onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
            required
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Quantity *"
              type="number"
              min="0"
              step="0.1"
              value={newIngredient.quantityValue}
              onChange={(e) => setNewIngredient({ ...newIngredient, quantityValue: parseFloat(e.target.value) || 0 })}
              required
            />
            
            <Input
              label="Unit *"
              value={newIngredient.quantityUnit}
              onChange={(e) => setNewIngredient({ ...newIngredient, quantityUnit: e.target.value })}
              placeholder="g, ml, count, etc."
              required
            />
          </div>
          
          <Select
            label="Category"
            options={categories}
            value={newIngredient.category}
            onChange={(e) => setNewIngredient({ ...newIngredient, category: e.target.value })}
          />
          
          <Input
            label="Notes"
            value={newIngredient.notes}
            onChange={(e) => setNewIngredient({ ...newIngredient, notes: e.target.value })}
            placeholder="Additional notes..."
          />

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Add Ingredient
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