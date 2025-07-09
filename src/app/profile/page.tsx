'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import TopNav from '@/components/navigation/TopNav'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Trophy } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<{ first_name: string, last_name: string, email: string, created_at: string } | null>(null)
  const [solvedCount, setSolvedCount] = useState<number | null>(null)
  const [userPlan, setUserPlan] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      // Fetch profile data, solved puzzles count, and user plan
      const [profileRes, solvedRes, planRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('first_name, last_name, email, created_at')
          .eq('id', user.id)
          .single(),
        supabase
          .from('user_puzzle_attempts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('solved', true),
        supabase
          .from('credits')
          .select('plan')
          .eq('id', user.id)
          .single()
      ])
      
      if (!profileRes.error && profileRes.data) setProfile(profileRes.data)
      if (!solvedRes.error) setSolvedCount(solvedRes.count ?? 0)
      if (!planRes.error && planRes.data) setUserPlan(planRes.data.plan)
    }
    fetchProfile()
  }, [user])

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">Your account information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>Your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{profile.first_name} {profile.last_name}</h3>
                    <p className="text-sm text-gray-500">{profile.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">First Name</label>
                    <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50">{profile.first_name}</div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Last Name</label>
                    <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50">{profile.last_name}</div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Email</label>
                    <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50">{profile.email}</div>
                  </div>
                </div>
                <Button className="mt-6" asChild>
                  <a href="/settings">Go to Settings</a>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Account Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {solvedCount !== null ? solvedCount : '...'}
                  </div>
                  <p className="text-sm text-gray-500">Puzzles Solved</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '...'}
                  </div>
                  <p className="text-sm text-gray-500">Member Since</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 capitalize">
                    {userPlan || '...'}
                  </div>
                  <p className="text-sm text-gray-500">Plan</p>
                </div>
              </CardContent>
            </Card>


          </div>
        </div>
      </div>
    </div>
  )
} 