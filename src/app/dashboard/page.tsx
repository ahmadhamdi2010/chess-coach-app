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
  Award,
  Play,
  Settings as SettingsIcon
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [solvedCount, setSolvedCount] = useState<number | null>(null)
  const [totalAttempts, setTotalAttempts] = useState<number | null>(null)
  const [userPlan, setUserPlan] = useState<{ plan: string, available_credits: number, first_name?: string } | null>(null)
  const [showPlanSelection, setShowPlanSelection] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'paid1' | 'paid2'>('free')
  const [planLoading, setPlanLoading] = useState(false)

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
          {userPlan ? (
            <>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {userPlan.first_name || user.email?.split('@')[0]}!
              </h1>
              <p className="text-gray-600 mt-1">Your account's dashboard and overview</p>
            </>
          ) : (
            <div className="h-10 w-48 bg-gray-200 rounded animate-pulse mb-2" />
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left/Main Column: Puzzles Solved, Success Rate, View Stats */}
          <div className="lg:col-span-2 flex flex-col gap-6">
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
            {/* View Stats Card at the bottom */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">View Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href="/stats">
                  <Button className="w-full" variant="outline">
                    View Stats
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Available Credits, Daily Puzzle */}
          <div className="space-y-6">
            {/* Credits Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Available Credits
                </CardTitle>
                <CardDescription>
                  Use credits to prompt our chess AI agent
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
            {/* Daily Puzzle Card under Credits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Daily Puzzle
                </CardTitle>
                <CardDescription>Today's featured puzzle</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/puzzle?daily=1">
                  <Button className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Attempt Puzzle
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/support">
                  <Button className="h-20 flex flex-col items-center justify-center gap-2 w-full" variant="outline">
                    <BookOpen className="h-6 w-6" />
                    <span>Support</span>
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button className="h-20 flex flex-col items-center justify-center gap-2 w-full" variant="outline">
                    <SettingsIcon className="h-6 w-6" />
                    <span>Settings</span>
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button className="h-20 flex flex-col items-center justify-center gap-2 w-full" variant="outline">
                    <User className="h-6 w-6" />
                    <span>Profile</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 