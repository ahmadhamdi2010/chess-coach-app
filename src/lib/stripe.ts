import Stripe from 'stripe'

// Server-side Stripe configuration (only used in API routes)
let stripe: Stripe | null = null

if (typeof window === 'undefined') {
  // Only initialize on server side
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('STRIPE_SECRET_KEY is not set - server-side Stripe features will be disabled')
  } else {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-06-30.basil',
      typescript: true,
    })
  }
}

export { stripe }

// Client-side accessible configuration
export const STRIPE_PAYMENT_LINK = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK || 'https://buy.stripe.com/test_eVq14odSN3eN15y0CIcfK00'

// Monthly subscription price in cents ($3.00)
export const MONTHLY_PRICE_CENTS = 300 