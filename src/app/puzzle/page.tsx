'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import TopNav from '@/components/navigation/TopNav'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Target, MessageSquare, RotateCcw, SkipForward } from 'lucide-react'

export default function PuzzlePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

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
          {/* Puzzle Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Daily Puzzle #157</h1>
                <p className="text-gray-600">White to move and win</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button variant="outline" size="sm">
                  <SkipForward className="h-4 w-4 mr-2" />
                  Skip
                </Button>
              </div>
            </div>
          </div>

          {/* Main Puzzle Area */}
          <div className="flex-1">
            {/* Chess Board and Move History */}
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Chess Board
                </CardTitle>
                <CardDescription>
                  Current position - White to move
                </CardDescription>
              </CardHeader>
              <CardContent className="h-full flex gap-6">
                {/* Chess Board */}
                <div className="flex-1 flex items-center justify-center">
                  <iframe 
                    src="https://lichess.org/embed/analysis?fen=r1bqkb1r/pp2pppp/2np1n2/6B1/3NP3/2N5/PPP2PPP/R2QKB1R_b_KQkq_-_1_6&color=black" 
                    style={{ width: '100%', aspectRatio: '4/3' }} 
                    frameBorder="0"
                    className="rounded-lg shadow-lg"
                  />
                </div>

                {/* Move History - Compact Column */}
                <div className="w-64 flex flex-col">
                  <div className="mb-3">
                    <h3 className="text-sm font-medium text-gray-900">Move History</h3>
                    <p className="text-xs text-gray-500">Previous moves in this puzzle</p>
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center">
                    <div className="text-center p-4">
                      <p className="text-gray-500 font-medium text-sm">Move History</p>
                      <p className="text-xs text-gray-400">Previous moves will be listed here</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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
            <div className="h-full bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-300">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Chat Messages</p>
                <p className="text-sm text-gray-400">AI coach messages will appear here</p>
              </div>
            </div>
          </div>

          {/* Chat Input Area */}
          <div className="p-4 border-t border-gray-200">
            <div className="space-y-3">
              {/* Quick Action Buttons */}
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Hint
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Solution
                </Button>
              </div>
              
              {/* Message Input */}
              <div className="bg-gray-50 rounded-lg border border-dashed border-gray-300 h-20 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-500 font-medium">Message Input</p>
                  <p className="text-sm text-gray-400">Type your message here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 