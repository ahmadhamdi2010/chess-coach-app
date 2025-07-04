'use client'

import { STRIPE_PAYMENT_LINK } from '@/lib/stripe'

export default function TestEnvPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Environment Variables Test</h1>
        <div className="space-y-2">
          <p><strong>STRIPE_PAYMENT_LINK:</strong></p>
          <p className="text-sm text-gray-600 break-all">{STRIPE_PAYMENT_LINK}</p>
          <p><strong>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:</strong></p>
          <p className="text-sm text-gray-600 break-all">{process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}</p>
        </div>
      </div>
    </div>
  )
} 