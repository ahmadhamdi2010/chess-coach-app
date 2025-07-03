'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import TopNav from '@/components/navigation/TopNav'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings, Bell, Shield, Palette, Globe } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function SettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<{ first_name: string, last_name: string } | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [saving, setSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState<string | null>(null)
  const [resetMsg, setResetMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id!)
        .single()
      if (!error && data) {
        setProfile(data)
        setFirstName(data.first_name)
        setLastName(data.last_name)
      }
    }
    fetchProfile()
  }, [user])

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setProfileMsg(null)
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ first_name: firstName, last_name: lastName })
      .eq('id', user.id!)
    if (error) {
      setProfileMsg('Failed to update profile.')
    } else {
      setProfileMsg('Profile updated successfully!')
    }
    setSaving(false)
  }

  const handlePasswordReset = async () => {
    setResetMsg(null)
    if (!user || !user.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(user.email as string)
    if (error) {
      setResetMsg('Failed to send password reset email.')
    } else {
      setResetMsg('Password reset email sent!')
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
      
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Customize your ChessCoach experience</p>
        </div>

        {/* Profile Settings Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Profile Settings
            </CardTitle>
            <CardDescription>Update your name or reset your password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSave} className="space-y-4 max-w-lg">
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="text-sm font-medium">First Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    required
                    disabled={saving}
                  />
                </div>
                <div className="w-1/2">
                  <label className="text-sm font-medium">Last Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    required
                    disabled={saving}
                  />
                </div>
              </div>
              {profileMsg && <div className="text-sm text-green-600">{profileMsg}</div>}
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
            </form>
            <div className="mt-6">
              <label className="text-sm font-medium block mb-2">Reset Password</label>
              <Button variant="outline" onClick={handlePasswordReset}>Send Password Reset Email</Button>
              {resetMsg && <div className="text-sm text-green-600 mt-2">{resetMsg}</div>}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Daily Puzzle Reminders</p>
                  <p className="text-sm text-gray-500">Get notified about new daily puzzles</p>
                </div>
                <Button variant="outline" size="sm">Enabled</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Progress Updates</p>
                  <p className="text-sm text-gray-500">Receive updates on your chess progress</p>
                </div>
                <Button variant="outline" size="sm">Enabled</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-500">Receive important updates via email</p>
                </div>
                <Button variant="outline" size="sm">Disabled</Button>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
              <CardDescription>Manage your account security and privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-500">Add an extra layer of security</p>
                </div>
                <Button variant="outline" size="sm">Set Up</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Change Password</p>
                  <p className="text-sm text-gray-500">Update your account password</p>
                </div>
                <Button variant="outline" size="sm">Change</Button>
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription>Customize the look and feel of ChessCoach</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Theme</p>
                  <p className="text-sm text-gray-500">Choose your preferred theme</p>
                </div>
                <Button variant="outline" size="sm">Light</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Board Style</p>
                  <p className="text-sm text-gray-500">Select your preferred chess board style</p>
                </div>
                <Button variant="outline" size="sm">Classic</Button>
              </div>
            </CardContent>
          </Card>

          {/* Language & Region */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Language & Region
              </CardTitle>
              <CardDescription>Set your language and regional preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Language</p>
                  <p className="text-sm text-gray-500">Choose your preferred language</p>
                </div>
                <Button variant="outline" size="sm">English</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Time Zone</p>
                  <p className="text-sm text-gray-500">Set your local time zone</p>
                </div>
                <Button variant="outline" size="sm">Auto-detect</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 