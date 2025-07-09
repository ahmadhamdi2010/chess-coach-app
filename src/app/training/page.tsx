'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import TopNav from '@/components/navigation/TopNav'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Target, Clock, Trophy, Play } from 'lucide-react'
import Link from 'next/link'

export default function PuzzlesPage() {
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
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Training</h1>
          <p className="text-gray-600 mt-1">Challenge yourself with tactical training sessions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Daily Puzzle
              </CardTitle>
              <CardDescription>Today's featured puzzle</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <p className="text-gray-500">Puzzle board will be displayed here</p>
              </div>
              <Link href="/puzzle">
                <Button className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Start Training
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Puzzle History
              </CardTitle>
              <CardDescription>Your recent puzzle attempts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <span className="text-sm">Puzzle #156</span>
                  <span className="text-green-600 text-sm">✓ Solved</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                  <span className="text-sm">Puzzle #155</span>
                  <span className="text-red-600 text-sm">✗ Failed</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <span className="text-sm">Puzzle #154</span>
                  <span className="text-green-600 text-sm">✓ Solved</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Puzzle Stats
              </CardTitle>
              <CardDescription>Your puzzle performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">156</div>
                  <p className="text-sm text-gray-500">Total Solved</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">68%</div>
                  <p className="text-sm text-gray-500">Success Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Puzzle List Table */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Available Training Sessions</h2>
          <div className="overflow-x-auto rounded-lg shadow border bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puzzle #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Side</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Mock data */}
                {[
                  { number: 201, rating: 1200, side: 'White', category: 'Fork' },
                  { number: 202, rating: 1350, side: 'Black', category: 'Pin' },
                  { number: 203, rating: 1500, side: 'White', category: 'Discovered Attack' },
                  { number: 204, rating: 1600, side: 'Black', category: 'Back Rank' },
                  { number: 205, rating: 1700, side: 'White', category: 'Skewer' },
                ].map((puzzle) => (
                  <tr key={puzzle.number}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">#{puzzle.number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{puzzle.rating}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{puzzle.side}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                        {puzzle.category}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
} 