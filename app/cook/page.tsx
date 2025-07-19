'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useActiveSession } from '@/lib/hooks'
import { useStore } from '@/lib/store'
import Button from '@/components/Button'
import DataFetchBoundary from '@/components/DataFetchBoundary'
import { Recipe, CookTimer } from '@/lib/types'

export default function CookPage() {
  const router = useRouter()
  const { activeSession, loading, error } = useActiveSession()
  const { setActiveSession, showToast } = useStore()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [timers, setTimers] = useState<Array<CookTimer & { remainingSeconds: number }>>([])
  
  useEffect(() => {
    if (activeSession) {
      // Fetch recipe details
      fetch(`/api/recipes/${activeSession.recipeId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setRecipe(data.data)
          }
        })
      
      // Initialize timers with remaining time
      const now = new Date()
      const activeTimers = activeSession.timers.map(timer => ({
        ...timer,
        remainingSeconds: Math.max(0, Math.floor((new Date(timer.targetEndTime).getTime() - now.getTime()) / 1000))
      })).filter(timer => timer.remainingSeconds > 0)
      
      setTimers(activeTimers)
    }
  }, [activeSession])
  
  // Timer countdown effect
  useEffect(() => {
    if (timers.length === 0) return
    
    const interval = setInterval(() => {
      setTimers(prevTimers => {
        const updatedTimers = prevTimers.map(timer => ({
          ...timer,
          remainingSeconds: Math.max(0, timer.remainingSeconds - 1)
        }))
        
        // Check for completed timers
        updatedTimers.forEach(timer => {
          if (timer.remainingSeconds === 0) {
            showToast(`Timer finished: ${timer.label}`, 'success')
          }
        })
        
        return updatedTimers.filter(timer => timer.remainingSeconds > 0)
      })
    }, 1000)
    
    return () => clearInterval(interval)
  }, [timers.length, showToast])
  
  const handleNextStep = async () => {
    if (!activeSession || !recipe) return
    
    const nextStepIndex = Math.min(activeSession.currentStepIndex + 1, recipe.steps.length)
    
    try {
      const response = await fetch(`/api/cook-sessions/${activeSession.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentStepIndex: nextStepIndex }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setActiveSession(data.data)
      }
    } catch (error) {
      showToast('Error updating step', 'error')
    }
  }
  
  const handlePreviousStep = async () => {
    if (!activeSession) return
    
    const prevStepIndex = Math.max(1, activeSession.currentStepIndex - 1)
    
    try {
      const response = await fetch(`/api/cook-sessions/${activeSession.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentStepIndex: prevStepIndex }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setActiveSession(data.data)
      }
    } catch (error) {
      showToast('Error updating step', 'error')
    }
  }
  
  const handleStartTimer = async (stepIndex: number, label: string, durationSeconds: number) => {
    if (!activeSession) return
    
    try {
      const response = await fetch(`/api/cook-sessions/${activeSession.id}/timers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepIndex,
          label,
          durationSeconds,
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        const newTimer = {
          ...data.data,
          remainingSeconds: durationSeconds,
        }
        setTimers(prev => [...prev, newTimer])
        showToast(`Timer started: ${label}`, 'success')
      }
    } catch (error) {
      showToast('Error starting timer', 'error')
    }
  }
  
  const handleCancelTimer = async (timerId: string) => {
    if (!activeSession) return
    
    try {
      const response = await fetch(`/api/cook-sessions/${activeSession.id}/timers/${timerId}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (data.success) {
        setTimers(prev => prev.filter(timer => timer.id !== timerId))
        showToast('Timer cancelled', 'success')
      }
    } catch (error) {
      showToast('Error cancelling timer', 'error')
    }
  }
  
  const handleEndSession = async () => {
    if (!activeSession) return
    
    if (!confirm('Are you sure you want to end this cooking session?')) return
    
    try {
      const response = await fetch(`/api/cook-sessions/${activeSession.id}/end`, {
        method: 'POST',
      })
      
      const data = await response.json()
      
      if (data.success) {
        setActiveSession(null)
        showToast('Cooking session completed!', 'success')
        router.push('/')
      }
    } catch (error) {
      showToast('Error ending session', 'error')
    }
  }
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  if (!activeSession && !loading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Active Cooking Session</h1>
          <p className="text-gray-600 mb-6">
            Start a recipe from the Chat page or Recipe Library to begin cooking.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => router.push('/')}>
              Go to Chat
            </Button>
            <Button variant="secondary" onClick={() => router.push('/recipes')}>
              Browse Recipes
            </Button>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <DataFetchBoundary loading={loading} error={error}>
      {activeSession && recipe && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Cooking: {recipe.title}
                </h1>
                <p className="text-gray-600">
                  Servings: {activeSession.servings} | Step {activeSession.currentStepIndex} of {recipe.steps.length}
                </p>
              </div>
              <Button variant="danger" onClick={handleEndSession}>
                End Session
              </Button>
            </div>
            
            {/* Active Timers */}
            {timers.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-blue-900 mb-3">Active Timers</h3>
                <div className="space-y-2">
                  {timers.map(timer => (
                    <div key={timer.id} className="flex items-center justify-between bg-white rounded p-3">
                      <div>
                        <span className="font-medium">{timer.label}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          (Step {timer.stepIndex})
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-mono text-lg ${
                          timer.remainingSeconds <= 60 ? 'text-red-600' : 'text-blue-600'
                        }`}>
                          {formatTime(timer.remainingSeconds)}
                        </span>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleCancelTimer(timer.id)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Current Step */}
            <div className="mb-6">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-yellow-400 text-yellow-800 rounded-full font-medium">
                      {activeSession.currentStepIndex}
                    </span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-yellow-800">Current Step</h3>
                    <p className="text-yellow-700 mt-1">
                      {recipe.steps.find(step => step.index === activeSession.currentStepIndex)?.text}
                    </p>
                    {recipe.steps.find(step => step.index === activeSession.currentStepIndex)?.timerSuggestionSeconds && (
                      <div className="mt-3">
                        <Button
                          size="sm"
                          onClick={() => {
                            const step = recipe.steps.find(s => s.index === activeSession.currentStepIndex)
                            if (step?.timerSuggestionSeconds) {
                              handleStartTimer(
                                step.index,
                                `Step ${step.index} Timer`,
                                step.timerSuggestionSeconds
                              )
                            }
                          }}
                        >
                          Start Timer ({formatTime(recipe.steps.find(step => step.index === activeSession.currentStepIndex)?.timerSuggestionSeconds || 0)})
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Navigation Controls */}
            <div className="flex justify-between items-center mb-6">
              <Button
                variant="secondary"
                onClick={handlePreviousStep}
                disabled={activeSession.currentStepIndex <= 1}
              >
                Previous Step
              </Button>
              
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Jump to Step:</label>
                <select
                  value={activeSession.currentStepIndex}
                  onChange={(e) => {
                    const stepIndex = parseInt(e.target.value)
                    fetch(`/api/cook-sessions/${activeSession.id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ currentStepIndex: stepIndex }),
                    }).then(res => res.json()).then(data => {
                      if (data.success) setActiveSession(data.data)
                    })
                  }}
                  className="rounded border border-gray-300 px-2 py-1"
                >
                  {recipe.steps.map(step => (
                    <option key={step.index} value={step.index}>
                      {step.index}
                    </option>
                  ))}
                </select>
              </div>
              
              <Button
                onClick={handleNextStep}
                disabled={activeSession.currentStepIndex >= recipe.steps.length}
              >
                Next Step
              </Button>
            </div>
            
            {/* All Steps List */}
            <div>
              <h3 className="text-xl font-semibold mb-4">All Steps</h3>
              <div className="space-y-3">
                {recipe.steps.map((step) => (
                  <div
                    key={step.index}
                    className={`p-4 rounded-lg border ${
                      step.index === activeSession.currentStepIndex
                        ? 'border-yellow-400 bg-yellow-50'
                        : step.index < activeSession.currentStepIndex
                        ? 'border-green-400 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                        step.index === activeSession.currentStepIndex
                          ? 'bg-yellow-400 text-yellow-800'
                          : step.index < activeSession.currentStepIndex
                          ? 'bg-green-400 text-green-800'
                          : 'bg-gray-300 text-gray-700'
                      }`}>
                        {step.index < activeSession.currentStepIndex ? '✓' : step.index}
                      </span>
                      <div className="flex-1">
                        <p>{step.text}</p>
                        {step.estimatedMinutes && (
                          <p className="text-sm text-gray-500 mt-1">
                            ~{step.estimatedMinutes} minutes
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </DataFetchBoundary>
  )
}