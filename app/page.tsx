'use client'

import { useState, useRef, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import Button from '@/components/Button'
import { ChatMessage } from '@/lib/types'

export default function ChatPage() {
  const router = useRouter()
  const { messages, setMessages, showToast } = useStore()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          newMessage: input,
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMessages([...messages, ...data.data])
        setInput('')
        
        // Handle navigation for cook session
        const lastMessage = data.data[data.data.length - 1]
        if (lastMessage.actionType === 'START_COOK_SESSION') {
          showToast('Cook session started!', 'success')
          setTimeout(() => router.push('/cook'), 1000)
        }
      } else {
        showToast('Failed to send message', 'error')
      }
    } catch (error) {
      showToast('Error sending message', 'error')
    } finally {
      setLoading(false)
    }
  }
  
  const renderMessage = (message: ChatMessage) => {
    if (message.role === 'action' && message.actionPayload) {
      return (
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="font-medium text-blue-900 mb-2">{message.content}</p>
          {renderActionPayload(message)}
        </div>
      )
    }
    
    return (
      <div className={`rounded-lg p-4 ${
        message.role === 'user' ? 'bg-gray-100' : 'bg-white border border-gray-200'
      }`}>
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    )
  }
  
  const renderActionPayload = (message: ChatMessage) => {
    switch (message.actionType) {
      case 'LIST_FEASIBLE':
        return (
          <div className="space-y-2">
            {message.actionPayload.map((recipe: any) => (
              <div
                key={recipe.id}
                className="bg-white p-3 rounded border border-blue-200 cursor-pointer hover:bg-blue-50"
                onClick={() => router.push(`/recipes/${recipe.id}`)}
              >
                <h4 className="font-medium">{recipe.title}</h4>
                {recipe.description && (
                  <p className="text-sm text-gray-600">{recipe.description}</p>
                )}
              </div>
            ))}
          </div>
        )
        
      case 'OPEN_RECIPE':
        return (
          <div className="bg-white p-4 rounded border border-blue-200">
            <h4 className="font-medium text-lg mb-2">{message.actionPayload.title}</h4>
            <p className="text-gray-600 mb-3">{message.actionPayload.description}</p>
            <p className="text-sm text-gray-500 mb-3">
              Servings: {message.actionPayload.baseServings}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => router.push(`/recipes/${message.actionPayload.id}`)}
              >
                View Recipe
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setInput('Start cooking')}
              >
                Start Cooking
              </Button>
            </div>
          </div>
        )
        
      case 'SCALE_RECIPE':
        return (
          <div className="bg-white p-4 rounded border border-blue-200">
            <h4 className="font-medium mb-2">
              {message.actionPayload.title} - {message.actionPayload.targetServings} servings
            </h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-1">Ingredient</th>
                  <th className="text-left py-1">Amount</th>
                </tr>
              </thead>
              <tbody>
                {message.actionPayload.ingredients.map((ing: any, idx: number) => (
                  <tr key={idx} className="border-b">
                    <td className="py-1">{ing.ingredientName}</td>
                    <td className="py-1">
                      {ing.scaledAmount && ing.amountUnit
                        ? `${ing.scaledAmount.toFixed(1)} ${ing.amountUnit}`
                        : 'To taste'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
        
      case 'MISSING_INGREDIENTS':
        return (
          <div className="bg-white p-4 rounded border border-blue-200">
            <h4 className="font-medium mb-2">Missing ingredients for {message.actionPayload.recipeTitle}:</h4>
            <ul className="space-y-1">
              {message.actionPayload.missing.map((item: any, idx: number) => (
                <li key={idx} className="text-sm">
                  • {item.name}: need {item.neededAmount} {item.neededUnit}
                </li>
              ))}
            </ul>
            <Button
              size="sm"
              className="mt-3"
              onClick={() => setInput('Add missing to shopping list')}
            >
              Add to Shopping List
            </Button>
          </div>
        )
        
      case 'ADD_TO_SHOPPING_LIST':
        return (
          <div className="bg-white p-4 rounded border border-blue-200">
            <p className="text-sm text-gray-600">
              Successfully added {message.actionPayload.added.length} items to your shopping list.
            </p>
            <Button
              size="sm"
              className="mt-2"
              onClick={() => router.push('/shopping-list')}
            >
              View Shopping List
            </Button>
          </div>
        )
        
      default:
        return null
    }
  }
  
  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-4">Welcome to Recipe Assistant!</p>
            <p>Try asking "What can I cook?" to see recipes you can make with your ingredients.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${message.role === 'user' ? 'ml-auto' : ''}`}>
                {renderMessage(message)}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about recipes, ingredients, or cooking..."
          className="flex-1 rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={loading}
        />
        <Button type="submit" disabled={loading || !input.trim()}>
          {loading ? 'Sending...' : 'Send'}
        </Button>
      </form>
    </div>
  )
}