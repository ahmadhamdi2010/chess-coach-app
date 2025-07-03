'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import TopNav from '@/components/navigation/TopNav'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Trophy, 
  Target, 
  BookOpen, 
  User, 
  TrendingUp, 
  Clock, 
  Zap,
  BarChart3,
  Calendar,
  Award
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [solvedCount, setSolvedCount] = useState<number | null>(null)
  const [totalAttempts, setTotalAttempts] = useState<number | null>(null)
  const [userPlan, setUserPlan] = useState<{ plan: string, available_credits: number, first_name?: string } | null>(null)
  const [showPlanSelection, setShowPlanSelection] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'paid1' | 'paid2'>('free')
  const [planLoading, setPlanLoading] = useState(false)
  const [userDataLoading, setUserDataLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  // Fetch solved puzzles count and total attempts
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      const solvedRes = await supabase
        .from('user_puzzle_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('solved', true)
      const totalRes = await supabase
        .from('user_puzzle_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      if (!solvedRes.error) setSolvedCount(solvedRes.count ?? 0)
      if (!totalRes.error) setTotalAttempts(totalRes.count ?? 0)
    }
    fetchStats()
  }, [user])

  // Check if user has a plan
  useEffect(() => {
    const checkUserPlan = async () => {
      if (!user) return;
      setUserDataLoading(true)
      // Fetch credits and profile data
      const [creditsRes, profileRes] = await Promise.all([
        supabase
          .from('credits')
          .select('plan, available_credits')
          .eq('id', user.id)
          .single(),
        supabase
          .from('profiles')
          .select('first_name')
          .eq('id', user.id)
          .single()
      ])
      
      if (creditsRes.error || !creditsRes.data) {
        setShowPlanSelection(true)
      } else {
        setUserPlan({
          ...creditsRes.data,
          first_name: profileRes.data?.first_name
        })
      }
      setUserDataLoading(false)
    }
    checkUserPlan()
  }, [user])

  const handlePlanSelection = async () => {
    setPlanLoading(true)
    try {
      const credits = selectedPlan === 'free' ? 100 : 200
      const { error } = await supabase
        .from('credits')
        .insert([{
          id: user!.id,
          available_credits: credits,
          plan: selectedPlan
        }])
      if (error) {
        console.error('Plan selection error:', error)
      } else {
        setUserPlan({ plan: selectedPlan, available_credits: credits })
        setShowPlanSelection(false)
      }
    } catch (err) {
      console.error('Plan selection exception:', err)
    } finally {
      setPlanLoading(false)
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

  // Show plan selection if user doesn't have a plan
  if (showPlanSelection) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Choose Your Plan</CardTitle>
              <CardDescription className="text-center">
                Select a plan to get started with ChessCoach
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedPlan === 'free' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPlan('free')}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">Free Plan</h3>
                      <p className="text-sm text-gray-600">Perfect for getting started</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-purple-600">100 Credits</div>
                      <div className="text-sm text-gray-500">$0/month</div>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedPlan === 'paid1' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPlan('paid1')}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">Paid Plan 1</h3>
                      <p className="text-sm text-gray-600">For serious players</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-purple-600">200 Credits</div>
                      <div className="text-sm text-gray-500">$9.99/month</div>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedPlan === 'paid2' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPlan('paid2')}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">Paid Plan 2</h3>
                      <p className="text-sm text-gray-600">For advanced players</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-purple-600">200 Credits</div>
                      <div className="text-sm text-gray-500">$19.99/month</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button 
                className="w-full" 
                onClick={handlePlanSelection}
                disabled={planLoading}
              >
                {planLoading ? 'Setting up account...' : 'Continue with selected plan'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {userDataLoading ? (
              'Loading...'
            ) : (
              `Welcome back, ${userPlan?.first_name || user.email?.split('@')[0]}!`
            )}
          </h1>
          <p className="text-gray-600 mt-1">Here's your chess performance overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Performance Chart and Stats Row */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Over Time
                </CardTitle>
                <CardDescription>
                  Your rating progression over the last 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Performance chart will be displayed here</p>
                    <p className="text-sm text-gray-400">Chart library integration coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Stats Row under Performance Chart */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Puzzles Solved</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{solvedCount !== null ? solvedCount : '...'}</div>
                  <p className="text-xs text-muted-foreground">
                    {/* You can add a delta here if you want */}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totalAttempts === 0 ? '0%' : (totalAttempts && solvedCount !== null ? `${Math.round((solvedCount / totalAttempts) * 100)}%` : '...')}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {totalAttempts !== null && solvedCount !== null ? `${solvedCount} / ${totalAttempts} solved` : ''}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Credits and Quick Actions */}
          <div className="space-y-6">
            {/* Credits Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Available Credits
                </CardTitle>
                <CardDescription>
                  Use credits to access premium features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {userPlan?.available_credits || '...'}
                  </div>
                  <p className="text-sm text-gray-500">credits remaining</p>
                </div>
                <Button className="w-full" variant="outline">
                  Buy More Credits
                </Button>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Trophy className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Rating Milestone</p>
                    <p className="text-xs text-gray-500">Reached 1200+ rating</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Target className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Puzzle Master</p>
                    <p className="text-xs text-gray-500">Solved 100+ puzzles</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 bg-purple-50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Consistency</p>
                    <p className="text-xs text-gray-500">7-day study streak</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Jump back into your chess training
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="h-20 flex flex-col items-center justify-center gap-2" variant="outline">
                  <Target className="h-6 w-6" />
                  <span>Daily Puzzle</span>
                </Button>
                <Button className="h-20 flex flex-col items-center justify-center gap-2" variant="outline">
                  <BookOpen className="h-6 w-6" />
                  <span>Continue Lesson</span>
                </Button>
                <Button className="h-20 flex flex-col items-center justify-center gap-2" variant="outline">
                  <User className="h-6 w-6" />
                  <span>Play Game</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 