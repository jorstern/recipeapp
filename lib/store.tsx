'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Recipe, Ingredient, CookSession, ShoppingListItem, ChatMessage } from './types'

interface StoreContextType {
  // Chat
  messages: ChatMessage[]
  setMessages: (messages: ChatMessage[]) => void
  
  // Recipes
  recipes: Recipe[]
  setRecipes: (recipes: Recipe[]) => void
  
  // Ingredients
  ingredients: Ingredient[]
  setIngredients: (ingredients: Ingredient[]) => void
  updateIngredient: (id: string, updates: Partial<Ingredient>) => void
  
  // Cook Session
  activeSession: CookSession | null
  setActiveSession: (session: CookSession | null) => void
  
  // Shopping List
  shoppingList: ShoppingListItem[]
  setShoppingList: (items: ShoppingListItem[]) => void
  updateShoppingItem: (id: string, updates: Partial<ShoppingListItem>) => void
  
  // Toast
  toast: { message: string; type: 'success' | 'error' | 'info' } | null
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
  hideToast: () => void
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [activeSession, setActiveSession] = useState<CookSession | null>(null)
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([])
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  
  const updateIngredient = useCallback((id: string, updates: Partial<Ingredient>) => {
    setIngredients(prev => 
      prev.map(ing => ing.id === id ? { ...ing, ...updates } : ing)
    )
  }, [])
  
  const updateShoppingItem = useCallback((id: string, updates: Partial<ShoppingListItem>) => {
    setShoppingList(prev => 
      prev.map(item => item.id === id ? { ...item, ...updates } : item)
    )
  }, [])
  
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type })
  }, [])
  
  const hideToast = useCallback(() => {
    setToast(null)
  }, [])
  
  return (
    <StoreContext.Provider
      value={{
        messages,
        setMessages,
        recipes,
        setRecipes,
        ingredients,
        setIngredients,
        updateIngredient,
        activeSession,
        setActiveSession,
        shoppingList,
        setShoppingList,
        updateShoppingItem,
        toast,
        showToast,
        hideToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const context = useContext(StoreContext)
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider')
  }
  return context
}