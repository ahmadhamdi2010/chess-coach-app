'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import TopNav from '@/components/navigation/TopNav'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageSquare, Send } from 'lucide-react'
import ChessPuzzle from '@/components/chess/ChessPuzzle'

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

export default function PuzzlePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  // Handle puzzle move completion
  const handleMoveComplete = (puzzleId: string, fen: string, moveHistory: string[]) => {
    // Send puzzle data to webhook for chat integration
    sendPuzzleDataToWebhook(puzzleId, fen, moveHistory)
    
    // Add AI response based on the move
    const aiResponse = generateAIResponse(moveHistory.length)
    addMessage('ai', aiResponse)
  }

  // Handle puzzle completion
  const handlePuzzleComplete = (puzzleId: string, success: boolean) => {
    const completionMessage = success 
      ? "Excellent! You've solved the puzzle correctly. Great tactical thinking!"
      : "Good effort! Let's try another puzzle to improve your skills."
    
    addMessage('ai', completionMessage)
  }

  // Send puzzle data to webhook
  const sendPuzzleDataToWebhook = async (puzzleId: string, fen: string, moveHistory: string[]) => {
    try {
      const webhookData = {
        puzzleId,
        fen,
        moveHistory,
        userId: user?.id,
        timestamp: new Date().toISOString()
      }
      
      // Replace with your actual webhook URL
      await fetch('/api/puzzle-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      })
    } catch (error) {
      console.error('Failed to send puzzle data to webhook:', error)
    }
  }

  // Generate AI response based on move number
  const generateAIResponse = (moveNumber: number): string => {
    const responses = [
      "Good start! Look for tactical opportunities.",
      "Nice move! Keep looking for the best continuation.",
      "Excellent! You're on the right track.",
      "Perfect! The position is improving.",
      "Brilliant! You've found the key move."
    ]
    return responses[Math.min(moveNumber - 1, responses.length - 1)]
  }

  // Add message to chat
  const addMessage = (type: 'user' | 'ai', content: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }

  // Send user message
  const sendMessage = () => {
    if (inputMessage.trim()) {
      addMessage('user', inputMessage)
      setInputMessage('')
      
      // Simulate AI response
      setTimeout(() => {
        addMessage('ai', "I'm here to help you with the puzzle! What would you like to know?")
      }, 1000)
    }
  }

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      
      <div className="h-[calc(100vh-4rem)] flex">
        {/* Puzzle View Section - Left Side */}
        <div className="flex-1 flex flex-col p-6">
          <ChessPuzzle 
            onMoveComplete={handleMoveComplete}
            onPuzzleComplete={handlePuzzleComplete}
          />
        </div>

        {/* Chat Interface Section - Right Side */}
        <div className="w-96 flex flex-col border-l border-gray-200 bg-white">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">AI Coach</h2>
                <p className="text-sm text-gray-500">Get hints and explanations</p>
              </div>
              <Button variant="ghost" size="sm">
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="h-full bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-300">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">Chat Messages</p>
                  <p className="text-sm text-gray-400">AI coach messages will appear here</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chat Input Area */}
          <div className="p-4 border-t border-gray-200">
            <div className="space-y-3">
              {/* Quick Action Buttons */}
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => addMessage('user', 'Give me a hint')}
                >
                  Hint
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => addMessage('user', 'Show me the solution')}
                >
                  Solution
                </Button>
              </div>
              
              {/* Message Input */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button 
                  onClick={sendMessage}
                  disabled={!inputMessage.trim()}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 