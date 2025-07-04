'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { XCircle } from 'lucide-react'
import Link from 'next/link'

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-yellow-500" />
          </div>
          <CardTitle className="text-center text-yellow-600">Payment Canceled</CardTitle>
          <CardDescription className="text-center">
            Your payment was canceled. You can try again anytime or continue using the free plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-medium text-yellow-800 mb-2">Free Plan Features:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• 30 credits for AI coaching</li>
              <li>• Basic puzzle training</li>
              <li>• Daily puzzles</li>
              <li>• Community support</li>
            </ul>
          </div>
          <Link href="/dashboard">
            <Button className="w-full">Return to Dashboard</Button>
          </Link>
          <Link href="/puzzle">
            <Button variant="outline" className="w-full">Start Training</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
} 