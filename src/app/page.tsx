'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogOut, User, Trophy, BookOpen, Target, ArrowRight, Crown } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const { user, loading, signOut } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <LandingPage />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user.email?.split('@')[0]}!
            </h1>
            <p className="text-gray-600 mt-1">Ready to improve your chess game?</p>
          </div>
          <Button
            onClick={signOut}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Puzzle</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">
                New puzzle available
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rating</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1200</div>
              <p className="text-xs text-muted-foreground">
                +15 from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lessons</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                Completed this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Streak</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">
                Days in a row
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Chess Dashboard</CardTitle>
            <CardDescription>
              Track your progress and access your training materials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              You're successfully authenticated! This is where your chess training interface will go.
              The dashboard will show your progress, daily puzzles, and learning materials.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-2">
          <Crown className="h-8 w-8 text-white" />
          <span className="text-xl font-bold text-white">ChessCoach</span>
        </div>
        <div className="flex space-x-4">
          <Link href="/auth">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              Sign In
            </Button>
          </Link>
          <Link href="/auth">
            <Button className="bg-white text-slate-900 hover:bg-gray-100">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Master Chess with
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"> AI</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Learn chess strategies, solve puzzles, and improve your game with personalized AI coaching. 
            Join thousands of players who are already mastering the game.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button size="lg" className="bg-white text-slate-900 hover:bg-gray-100 px-8 py-3 text-lg">
                Start Learning Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-3 text-lg">
              Watch Demo
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-white">Daily Puzzles</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Challenge yourself with carefully curated puzzles designed to improve your tactical thinking.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-white">AI Coaching</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Get personalized feedback and strategies from our advanced AI chess coach.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-white">Track Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Monitor your improvement with detailed analytics and progress tracking.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to become a chess master?
        </h2>
        <p className="text-xl text-gray-300 mb-8">
          Join thousands of players improving their game every day.
        </p>
        <Link href="/auth">
          <Button size="lg" className="bg-white text-slate-900 hover:bg-gray-100 px-8 py-3 text-lg">
            Start Your Journey
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
