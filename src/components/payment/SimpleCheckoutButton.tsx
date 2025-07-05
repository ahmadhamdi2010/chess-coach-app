'use client'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { STRIPE_PAYMENT_LINK } from '@/lib/stripe'

interface SimpleCheckoutButtonProps {
  className?: string
  children?: React.ReactNode
}

export default function SimpleCheckoutButton({ 
  className = "",
  children = "Upgrade to Paid Plan"
}: SimpleCheckoutButtonProps) {
  const { user } = useAuth()
  
  const handleCheckout = () => {
    if (!user) {
      console.error('User not authenticated')
      return
    }

    // Add user ID as a parameter to track the payment
    const paymentUrl = `${STRIPE_PAYMENT_LINK}?client_reference_id=${user.id}&prefilled_email=${user.email}`
    
    // Redirect to Stripe payment link with user tracking
    window.location.href = paymentUrl
  }

  return (
    <Button 
      onClick={handleCheckout} 
      className={className}
    >
      {children}
    </Button>
  )
} 