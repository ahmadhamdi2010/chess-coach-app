'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { Puzzle } from '@/components/chess/ChessPuzzle'
import TopNav from '@/components/navigation/TopNav'
import { Button } from '@/components/ui/button'
import { MessageSquare, Send } from 'lucide-react'
import ChessPuzzle from '@/components/chess/ChessPuzzle'
import { Chess } from 'chess.js'

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

export default function PuzzlePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams();
  const isDaily = searchParams.get('daily') === '1';
  const [dailyPuzzle, setDailyPuzzle] = useState<Puzzle | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [currentPuzzleId, setCurrentPuzzleId] = useState<string | null>(null)
  const [currentMoveHistory, setCurrentMoveHistory] = useState<string[]>([])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  // Fetch daily puzzle if needed
  useEffect(() => {
    if (!isDaily) return;
    const fetchDaily = async () => {
      const res = await fetch('https://lichess.org/api/puzzle/daily');
      const data = await res.json();
      // Derive FEN from PGN and initialPly
      let fen = '';
      try {
        const chess = new Chess();
        const moves = data.game.pgn.split(' ');
        const puzzleStartPly = data.puzzle.initialPly || 0;
        for (let i = 0; i < puzzleStartPly; i++) {
          if (moves[i] && moves[i] !== '') {
            chess.move(moves[i]);
          }
        }
        fen = chess.fen();
      } catch (e) {
        fen = '';
      }
      setDailyPuzzle({
        id: data.puzzle.id,
        fen,
        moves: data.puzzle.solution,
        rating: data.puzzle.rating,
        category: data.puzzle.themes?.[0] || 'Daily',
        side: (data.puzzle.initialPly % 2 === 0 ? 'white' : 'black'),
        pgn: data.game.pgn,
        initialPly: data.puzzle.initialPly,
      });
    };
    fetchDaily();
  }, [isDaily]);

  // Handle puzzle move completion
  const handleMoveComplete = (puzzleId: string, fen: string, moveHistory: string[]) => {
    // Send puzzle data to webhook for chat integration
    sendPuzzleDataToWebhook(puzzleId, fen, moveHistory)
  }

  // Handle puzzle completion
  const handlePuzzleComplete = (puzzleId: string, success: boolean) => {
    // Removed automatic AI response
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

  // Add message to chat
  const addMessage = (type: 'user' | 'ai', content: string) => {
    const newMessage: ChatMessage = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      type,
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }

  // Send user message
  const sendMessage = async () => {
    if (inputMessage.trim()) {
      const userMessage = inputMessage;
      addMessage('user', userMessage);
      setInputMessage('');

      try {
        // Send the user message to the external webhook
        const response = await fetch('https://n8n.creativenour.tech/webhook/8fd26228-bda4-4aaf-a9d6-1ce049cc34b6', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userMessage,
            userId: user?.id,
            puzzleId: currentPuzzleId,
            moveHistory: currentMoveHistory,
            timestamp: new Date().toISOString(),
          }),
        });

        if (!response.ok) {
          throw new Error('Webhook response was not ok');
        }

        // Try to parse the response as JSON or text
        let aiReply = '';
        const responseText = await response.text();
        try {
          const data = JSON.parse(responseText);
          aiReply = data.reply || responseText;
        } catch {
          aiReply = responseText;
        }

        addMessage('ai', aiReply);
      } catch (error) {
        addMessage('ai', 'Sorry, there was an error contacting the AI coach.');
        console.error('Failed to send message to webhook:', error);
      }
    }
  };

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
          {isDaily && !dailyPuzzle ? (
            <div className="flex-1 flex items-center justify-center text-lg">Loading daily puzzle...</div>
          ) : (
            <ChessPuzzle 
              onMoveComplete={handleMoveComplete}
              onPuzzleComplete={handlePuzzleComplete}
              onPuzzleChange={setCurrentPuzzleId}
              onMoveHistoryChange={setCurrentMoveHistory}
              {...(isDaily && dailyPuzzle ? { puzzle: dailyPuzzle } : {})}
            />
          )}
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
              <div className="space-y-4">
                <div className="flex justify-start">
                  <div className="max-w-xs px-4 py-2 rounded-lg bg-gray-100 text-gray-900">
                    <p className="text-sm">Feel free to ask questions</p>
                    <p className="text-xs opacity-70 mt-1">AI Coach</p>
                  </div>
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
                  onKeyPress={async (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      await sendMessage();
                    }
                  }}
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