'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import TopNav from '@/components/navigation/TopNav'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { TrendingUp, Target } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { BarChart, Bar, CartesianGrid, XAxis, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

export default function StatsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [solvedCount, setSolvedCount] = useState<number | null>(null)
  const [totalAttempts, setTotalAttempts] = useState<number | null>(null)
  const [chartData, setChartData] = useState<unknown[]>([])
  const [categoryChartData, setCategoryChartData] = useState<unknown[]>([])
  const [userPlan, setUserPlan] = useState<string | null>(null)
  const [planLoading, setPlanLoading] = useState(true)
  // Date range state
  const today = new Date();
  const defaultStart = new Date(today);
  defaultStart.setDate(today.getDate() - 29);
  const [dateRange, setDateRange] = useState<{ start: string, end: string }>({
    start: defaultStart.toISOString().slice(0, 10),
    end: today.toISOString().slice(0, 10),
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  // Check user's plan
  useEffect(() => {
    const checkUserPlan = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('credits')
        .select('plan')
        .eq('id', user.id)
        .single()
      
      if (!error && data) {
        setUserPlan(data.plan)
        // Redirect free users to dashboard
        if (data.plan === 'free') {
          router.push('/dashboard')
        }
      }
      setPlanLoading(false)
    }
    checkUserPlan()
  }, [user, router])

  // Fetch solved puzzles count and total attempts for the selected range
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      let solvedQuery = supabase
        .from('user_puzzle_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('solved', true)
      let totalQuery = supabase
        .from('user_puzzle_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      if (dateRange.start) {
        solvedQuery = solvedQuery.gte('created_at', dateRange.start)
        totalQuery = totalQuery.gte('created_at', dateRange.start)
      }
      if (dateRange.end) {
        solvedQuery = solvedQuery.lte('created_at', dateRange.end + 'T23:59:59')
        totalQuery = totalQuery.lte('created_at', dateRange.end + 'T23:59:59')
      }
      const [{ count: solved, error: solvedError }, { count: total, error: totalError }] = await Promise.all([
        solvedQuery,
        totalQuery,
      ])
      if (!solvedError) setSolvedCount(solved ?? 0)
      if (!totalError) setTotalAttempts(total ?? 0)
    }
    fetchStats()
  }, [user, dateRange])

  // Fetch puzzle attempts for chart
  useEffect(() => {
    const fetchAttempts = async () => {
      if (!user) return;
      let query = supabase
        .from('user_puzzle_attempts')
        .select('solved, created_at')
        .eq('user_id', user.id)
      if (dateRange.start) query = query.gte('created_at', dateRange.start)
      if (dateRange.end) query = query.lte('created_at', dateRange.end + 'T23:59:59')
      const { data, error } = await query.order('created_at', { ascending: true })
      if (error || !data) return;
      // Group by day
      const dayMap: Record<string, { solved: number; failed: number }> = {}
      data.forEach((row: { solved: boolean; created_at: string }) => {
        const day = new Date(row.created_at).toLocaleDateString()
        if (!dayMap[day]) dayMap[day] = { solved: 0, failed: 0 }
        if (row.solved) dayMap[day].solved += 1
        else dayMap[day].failed += 1
      })
      // Convert to chart data array
      const chartArr = Object.entries(dayMap).map(([day, counts]) => ({
        day,
        solved: counts.solved,
        failed: counts.failed,
      }))
      setChartData(chartArr)
    }
    fetchAttempts()
  }, [user, dateRange])

  // Fetch puzzle attempts for category chart
  useEffect(() => {
    const fetchCategoryAttempts = async () => {
      if (!user) return;
      let query = supabase
        .from('user_puzzle_attempts')
        .select('solved, puzzle_category, created_at')
        .eq('user_id', user.id)
      if (dateRange.start) query = query.gte('created_at', dateRange.start)
      if (dateRange.end) query = query.lte('created_at', dateRange.end + 'T23:59:59')
      const { data, error } = await query
      if (error || !data) return;
      // Group by category
      const catMap: Record<string, { solved: number; failed: number }> = {}
      data.forEach((row: { solved: boolean; puzzle_category: string }) => {
        const cat = row.puzzle_category || 'Uncategorized'
        if (!catMap[cat]) catMap[cat] = { solved: 0, failed: 0 }
        if (row.solved) catMap[cat].solved += 1
        else catMap[cat].failed += 1
      })
      // Convert to chart data array
      const chartArr = Object.entries(catMap).map(([category, counts]) => ({
        category,
        solved: counts.solved,
        failed: counts.failed,
      }))
      setCategoryChartData(chartArr)
    }
    fetchCategoryAttempts()
  }, [user, dateRange])

  const chartConfig = {
    solved: {
      label: 'Solved',
      color: 'var(--chart-1)',
    },
    failed: {
      label: 'Failed',
      color: 'var(--chart-2)',
    },
  }

  const categoryChartConfig = {
    solved: {
      label: 'Solved',
      color: 'var(--chart-1)',
    },
    failed: {
      label: 'Failed',
      color: 'var(--chart-2)',
    },
  }

  if (loading || planLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Don't render if user is on free plan (they will be redirected)
  if (userPlan === 'free') {
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
        {/* Date Range Picker */}
        <div className="mb-8 flex gap-4 items-center">
          <label className="text-sm font-medium">Start Date:</label>
          <input
            type="date"
            value={dateRange.start}
            max={dateRange.end}
            onChange={e => setDateRange(r => ({ ...r, start: e.target.value }))}
            className="border rounded px-2 py-1"
          />
          <label className="text-sm font-medium">End Date:</label>
          <input
            type="date"
            value={dateRange.end}
            min={dateRange.start}
            max={today.toISOString().slice(0, 10)}
            onChange={e => setDateRange(r => ({ ...r, end: e.target.value }))}
            className="border rounded px-2 py-1"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Puzzle Results by Category</CardTitle>
              <CardDescription>Stacked bar chart of solved and failed puzzles per category</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={categoryChartConfig} height={320}>
                <BarChart data={categoryChartData} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="category" tickLine={false} tickMargin={10} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent hideLabel={false} />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="solved" stackId="a" fill="var(--chart-1)" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="failed" stackId="a" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Daily Puzzle Attempts</CardTitle>
              <CardDescription>Stacked bar chart of solved and failed puzzles per day</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} height={320}>
                <BarChart data={chartData} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="day" tickLine={false} tickMargin={10} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent hideLabel={false} />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="solved" stackId="a" fill="var(--chart-1)" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="failed" stackId="a" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
              <div className="flex gap-2 leading-none font-medium">
                Trending up <TrendingUp className="h-4 w-4" />
              </div>
              <div className="text-muted-foreground leading-none">
                Showing solved and failed puzzles per day
              </div>
            </CardFooter>
          </Card>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Remove Current Rating and Study Hours cards here */}
        </div>
      </div>
    </div>
  )
} 