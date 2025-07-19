'use client'

import { useState } from 'react'
import { useShoppingList } from '@/lib/hooks'
import { useStore } from '@/lib/store'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Modal from '@/components/Modal'
import DataFetchBoundary from '@/components/DataFetchBoundary'

export default function ShoppingListPage() {
  const { shoppingList, loading, error } = useShoppingList()
  const { setShoppingList, updateShoppingItem, showToast } = useStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [newItem, setNewItem] = useState({
    name: '',
    quantityValue: 0,
    quantityUnit: '',
  })

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newItem.name.trim()) {
      showToast('Please enter an item name', 'error')
      return
    }

    try {
      const response = await fetch('/api/shopping-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newItem.name,
          quantityValue: newItem.quantityValue || undefined,
          quantityUnit: newItem.quantityUnit || undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setShoppingList([...shoppingList, data.data])
        setShowAddModal(false)
        setNewItem({ name: '', quantityValue: 0, quantityUnit: '' })
        showToast('Item added to shopping list!', 'success')
      } else {
        showToast('Failed to add item', 'error')
      }
    } catch (error) {
      showToast('Error adding item', 'error')
    }
  }

  const handleToggleChecked = async (id: string, checked: boolean) => {
    try {
      const response = await fetch(`/api/shopping-list/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checked }),
      })

      const data = await response.json()

      if (data.success) {
        updateShoppingItem(id, { checked })
      } else {
        showToast('Failed to update item', 'error')
      }
    } catch (error) {
      showToast('Error updating item', 'error')
    }
  }

  const handleDeleteItem = async (id: string) => {
    try {
      const response = await fetch(`/api/shopping-list/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        setShoppingList(shoppingList.filter(item => item.id !== id))
        showToast('Item removed', 'success')
      } else {
        showToast('Failed to remove item', 'error')
      }
    } catch (error) {
      showToast('Error removing item', 'error')
    }
  }

  const handleExportText = async () => {
    try {
      const response = await fetch('/api/shopping-list/export?format=text')
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'shopping-list.txt'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        showToast('Shopping list exported!', 'success')
      } else {
        showToast('Failed to export list', 'error')
      }
    } catch (error) {
      showToast('Error exporting list', 'error')
    }
  }

  const handleExportCSV = async () => {
    try {
      const response = await fetch('/api/shopping-list/export?format=csv')
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'shopping-list.csv'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        showToast('Shopping list exported!', 'success')
      } else {
        showToast('Failed to export list', 'error')
      }
    } catch (error) {
      showToast('Error exporting list', 'error')
    }
  }

  const handleClearCompleted = async () => {
    const completedItems = shoppingList.filter(item => item.checked)
    
    if (completedItems.length === 0) {
      showToast('No completed items to clear', 'info')
      return
    }

    if (!confirm(`Remove ${completedItems.length} completed items?`)) return

    try {
      const promises = completedItems.map(item =>
        fetch(`/api/shopping-list/${item.id}`, { method: 'DELETE' })
      )
      
      await Promise.all(promises)
      
      setShoppingList(shoppingList.filter(item => !item.checked))
      showToast(`Removed ${completedItems.length} completed items`, 'success')
    } catch (error) {
      showToast('Error clearing completed items', 'error')
    }
  }

  const checkedItems = shoppingList.filter(item => item.checked)
  const uncheckedItems = shoppingList.filter(item => !item.checked)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Shopping List</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleExportText}>
            Export Text
          </Button>
          <Button variant="secondary" onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            Add Item
          </Button>
        </div>
      </div>

      <DataFetchBoundary loading={loading} error={error}>
        <div className="bg-white rounded-lg shadow-md">
          {/* Stats */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {shoppingList.length} total items • {checkedItems.length} completed • {uncheckedItems.length} remaining
              </div>
              {checkedItems.length > 0 && (
                <Button size="sm" variant="secondary" onClick={handleClearCompleted}>
                  Clear Completed ({checkedItems.length})
                </Button>
              )}
            </div>
          </div>

          {/* Shopping List Items */}
          <div className="divide-y divide-gray-200">
            {/* Unchecked items first */}
            {uncheckedItems.map((item) => (
              <div key={item.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={(e) => handleToggleChecked(item.id, e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-medium text-gray-900">{item.name}</span>
                      {item.quantityValue && item.quantityUnit && (
                        <span className="text-sm text-gray-500 ml-2">
                          {item.quantityValue} {item.quantityUnit}
                        </span>
                      )}
                      {item.sourceRecipeId && (
                        <span className="text-xs text-blue-600 ml-2 bg-blue-100 px-2 py-0.5 rounded">
                          from recipe
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-xs px-2 py-1"
                  >
                    ✕
                  </Button>
                </div>
              </div>
            ))}

            {/* Checked items at the bottom */}
            {checkedItems.map((item) => (
              <div key={item.id} className="px-6 py-4 hover:bg-gray-50 opacity-60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={(e) => handleToggleChecked(item.id, e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-medium text-gray-900 line-through">{item.name}</span>
                      {item.quantityValue && item.quantityUnit && (
                        <span className="text-sm text-gray-500 ml-2 line-through">
                          {item.quantityValue} {item.quantityUnit}
                        </span>
                      )}
                      {item.sourceRecipeId && (
                        <span className="text-xs text-blue-600 ml-2 bg-blue-100 px-2 py-0.5 rounded">
                          from recipe
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-xs px-2 py-1"
                  >
                    ✕
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {shoppingList.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-500">
              <p className="text-lg mb-2">Your shopping list is empty</p>
              <p className="text-sm">Add items manually or ask the chat to add missing ingredients from recipes.</p>
            </div>
          )}
        </div>
      </DataFetchBoundary>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Shopping List Item"
      >
        <form onSubmit={handleAddItem} className="space-y-4">
          <Input
            label="Item Name *"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            placeholder="e.g., Milk, Bread, Tomatoes"
            required
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Quantity"
              type="number"
              min="0"
              step="0.1"
              value={newItem.quantityValue}
              onChange={(e) => setNewItem({ ...newItem, quantityValue: parseFloat(e.target.value) || 0 })}
              placeholder="Optional"
            />
            
            <Input
              label="Unit"
              value={newItem.quantityUnit}
              onChange={(e) => setNewItem({ ...newItem, quantityUnit: e.target.value })}
              placeholder="e.g., lbs, dozen, bottles"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Add Item
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