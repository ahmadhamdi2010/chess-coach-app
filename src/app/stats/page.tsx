'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import TopNav from '@/components/navigation/TopNav'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function StatsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [solvedCount, setSolvedCount] = useState<number | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  // Fetch solved puzzles count (if needed for stats)
  useEffect(() => {
    const fetchSolvedCount = async () => {
      if (!user) return;
      const { count, error } = await supabase
        .from('user_puzzle_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('solved', true)
      if (!error) setSolvedCount(count ?? 0)
    }
    fetchSolvedCount()
  }, [user])

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
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Your Chess Stats
          </h1>
          <p className="text-gray-600 mt-1">Detailed breakdown of your chess activity</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Rating</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+23</span> from last week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24.5</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+3.2</span> this week
              </p>
            </CardContent>
          </Card>
          {/* Add more stat cards here as needed */}
        </div>
      </div>
    </div>
  )
} 