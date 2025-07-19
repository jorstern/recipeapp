'use client'

import { useEffect, useState } from 'react'
import { useStore } from './store'

export function useIngredients() {
  const { ingredients, setIngredients } = useStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  useEffect(() => {
    if (ingredients.length === 0) {
      fetch('/api/ingredients')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setIngredients(data.data)
          }
        })
        .catch(err => setError(err))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [ingredients.length, setIngredients])
  
  return { ingredients, loading, error }
}

export function useRecipes() {
  const { recipes, setRecipes } = useStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  useEffect(() => {
    if (recipes.length === 0) {
      fetch('/api/recipes')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setRecipes(data.data)
          }
        })
        .catch(err => setError(err))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [recipes.length, setRecipes])
  
  return { recipes, loading, error }
}

export function useActiveSession() {
  const { activeSession, setActiveSession } = useStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  useEffect(() => {
    if (!activeSession) {
      fetch('/api/cook-sessions/active')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setActiveSession(data.data)
          }
        })
        .catch(err => setError(err))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [activeSession, setActiveSession])
  
  return { activeSession, loading, error }
}

export function useShoppingList() {
  const { shoppingList, setShoppingList } = useStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  useEffect(() => {
    if (shoppingList.length === 0) {
      fetch('/api/shopping-list')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setShoppingList(data.data)
          }
        })
        .catch(err => setError(err))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [shoppingList.length, setShoppingList])
  
  return { shoppingList, loading, error }
}