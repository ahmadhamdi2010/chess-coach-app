'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import TopNav from '@/components/navigation/TopNav'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { 
  Target, 
  BookOpen, 
  User, 
  TrendingUp, 
  Zap,
  Play,
  Settings as SettingsIcon
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import SimpleCheckoutButton from '@/components/payment/SimpleCheckoutButton'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [solvedCount, setSolvedCount] = useState<number | null>(null)
  const [totalAttempts, setTotalAttempts] = useState<number | null>(null)
  const [userPlan, setUserPlan] = useState<{ plan: string, available_credits: number, first_name?: string } | null>(null)
  const [showPlanSelection, setShowPlanSelection] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'paid'>('free')
  const [planLoading, setPlanLoading] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [paymentCanceled, setPaymentCanceled] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  // Check for payment success/cancel in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('success') === 'true') {
      setPaymentSuccess(true)
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (urlParams.get('canceled') === 'true') {
      setPaymentCanceled(true)
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

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
    if (selectedPlan === 'paid') {
      // For paid plan, redirect to payment flow
      const paymentUrl = `${process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK}?client_reference_id=${user!.id}&prefilled_email=${user!.email}`
      window.location.href = paymentUrl
      return
    }

    // For free plan, set up the account
    setPlanLoading(true)
    try {
      const { error } = await supabase
        .from('credits')
        .insert([{
          id: user!.id,
          available_credits: 30,
          plan: 'free'
        }])
      if (error) {
        console.error('Plan selection error:', error)
      } else {
        setUserPlan({ plan: 'free', available_credits: 30 })
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
                      <p className="text-sm text-gray-600">Perfect for getting started (no stats page access)</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-purple-600">30 Credits</div>
                      <div className="text-sm text-gray-500">$0/month</div>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedPlan === 'paid' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPlan('paid')}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">Paid Plan</h3>
                      <p className="text-sm text-gray-600">Full access with detailed stats</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-purple-600">200 Credits</div>
                      <div className="text-sm text-gray-500">$3/month</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button 
                className="w-full" 
                onClick={handlePlanSelection}
                disabled={planLoading}
              >
                {planLoading ? 'Setting up account...' : selectedPlan === 'paid' ? 'Proceed to Payment' : 'Continue with Free Plan'}
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
        {/* Payment Status Messages */}
        {paymentSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Payment successful! Your account has been upgraded to the paid plan.
                </p>
              </div>
            </div>
          </div>
        )}

        {paymentCanceled && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-800">
                  Payment was canceled. You can try again anytime.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          {userPlan ? (
            <>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {userPlan.first_name || user.email?.split('@')[0]}!
              </h1>
              <p className="text-gray-600 mt-1">Your account&apos;s dashboard and overview</p>
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
                {userPlan?.plan === 'paid' ? (
                  <Link href="/stats">
                    <Button className="w-full" variant="outline">
                      View Stats
                    </Button>
                  </Link>
                ) : (
                  <div className="space-y-3">
                    <div className="text-center text-sm text-gray-600">
                      Upgrade to paid plan to unlock detailed statistics
                    </div>
                    <SimpleCheckoutButton 
                      className="w-full"
                    >
                      Upgrade to Paid Plan
                    </SimpleCheckoutButton>
                  </div>
                )}
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