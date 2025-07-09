'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      // Wait for auth to finish loading
      if (authLoading) {
        return
      }

      if (!user) {
        // Try to get session directly from Supabase as fallback
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (session?.user) {
          // Use the session user instead
          const directUser = session.user
          
          try {
            // Get parameters from URL
            const sessionId = searchParams.get('session_id')
            const customerEmail = searchParams.get('customer_email')

            // Update or insert user plan to paid
            const { error: updateError } = await supabase
              .from('credits')
              .upsert({
                id: directUser.id,
                plan: 'paid',
                available_credits: 200,
                stripe_customer_id: sessionId, // We can use session ID as reference
              })

            if (updateError) {
              console.error('Error updating user plan:', updateError)
              setError('Failed to update your plan. Please contact support.')
            } else {
              // setSuccess(true) // This line is removed
            }
          } catch (err) {
            console.error('Payment success handling error:', err)
            setError('An error occurred while processing your payment.')
          } finally {
            setLoading(false)
          }
          return
        }
        
        setError('User not authenticated. Please log in to complete your payment.')
        setLoading(false)
        // Redirect to login after a short delay
        setTimeout(() => {
          router.push('/auth')
        }, 3000)
        return
      }

      try {
        // Get parameters from URL
        const sessionId = searchParams.get('session_id')
        const customerEmail = searchParams.get('customer_email')

        // Update or insert user plan to paid
        const { error: updateError } = await supabase
          .from('credits')
          .upsert({
            id: user.id,
            plan: 'paid',
            available_credits: 200,
            stripe_customer_id: sessionId, // We can use session ID as reference
          })

        if (updateError) {
          console.error('Error updating user plan:', updateError)
          setError('Failed to update your plan. Please contact support.')
        } else {
          // setSuccess(true) // This line is removed
        }
      } catch (err) {
        console.error('Payment success handling error:', err)
        setError('An error occurred while processing your payment.')
      } finally {
        setLoading(false)
      }
    }

    handlePaymentSuccess()
  }, [user, searchParams, authLoading])

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-4" />
            <p className="text-lg font-medium">
              {authLoading ? 'Checking authentication...' : 'Processing your payment...'}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {authLoading ? 'Please wait while we verify your account.' : 'Please wait while we update your account.'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Payment Error</CardTitle>
            <CardDescription className="text-center">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/auth">
              <Button className="w-full">Log In</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">Return to Dashboard</Button>
            </Link>
            <Link href="/support">
              <Button variant="outline" className="w-full">Contact Support</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-center text-green-600">Payment Successful!</CardTitle>
          <CardDescription className="text-center">
            Your account has been upgraded to the paid plan. You now have access to all features including detailed statistics.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-800 mb-2">What's included:</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• 200 credits for AI coaching</li>
              <li>• Full access to statistics page</li>
              <li>• Detailed progress tracking</li>
              <li>• Priority support</li>
            </ul>
          </div>
          <Link href="/dashboard">
            <Button className="w-full">Go to Dashboard</Button>
          </Link>
          <Link href="/stats">
            <Button variant="outline" className="w-full">View Your Stats</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
} 