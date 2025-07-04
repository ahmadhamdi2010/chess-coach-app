# Basic Stripe Payment Setup

## Overview

This is a simplified Stripe payment solution using payment links. Users can upgrade from free to paid plan, and the system handles plan updates through redirect URLs.

## Environment Variables

Create a `.env.local` file with these variables:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51RhHZXICf5mCglao6qkB7B1gJzxzOfzaXjsuOCY7V3SR9NEHw4UY2lO14Pi1MGdsotHjVQOOAfCv0QNSolU4l1aS00qWwGgBsN
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51RhHZXICf5mCglaovrVg7l2iBuMhimLPnosVWMMKyK0RhIvyu67sCcPHh2bmhlQH7IIkAxcnJPIgH4blVKZb2g4Y009SSoftSA
NEXT_PUBLIC_STRIPE_PAYMENT_LINK=https://buy.stripe.com/test_eVq14odSN3eN15y0CIcfK00
```

## Database Schema

Run this SQL to add Stripe tracking fields:

```sql
ALTER TABLE credits 
ADD COLUMN stripe_customer_id TEXT,
ADD COLUMN stripe_subscription_id TEXT;
```

## Stripe Payment Link Configuration

### 1. Configure Your Payment Link URLs

Go to your Stripe payment link and set these URLs:

**Success URL:**
```
https://yourdomain.com/payment-success?session_id={CHECKOUT_SESSION_ID}&customer_email={CUSTOMER_EMAIL}
```

**Cancel URL:**
```
https://yourdomain.com/payment-cancel
```

### 2. Payment Link Settings

Make sure your payment link is configured for:
- **Price**: $3.00/month recurring subscription
- **Payment methods**: Credit/debit cards
- **Customer email**: Required field

## How It Works

### 1. **User Flow**
1. **New User**: Selects free plan during onboarding (30 credits)
2. **Free User**: Clicks "Upgrade to Paid Plan" button
3. **Payment**: Opens Stripe payment link with user tracking
4. **Success**: Redirects to `/payment-success` page
5. **Database Update**: Success page updates user plan to 'paid' (200 credits)
6. **Access**: User now has access to stats page and all features

### 2. **Plan Management**
- **Free Plan**: 30 credits, no stats access
- **Paid Plan**: 200 credits, full access including stats
- **Upgrade**: Free users can upgrade anytime via dashboard or settings
- **Access Control**: Stats page redirects free users to dashboard

### 3. **Error Handling**
- **Payment Canceled**: Redirects to `/payment-cancel` page
- **Payment Failed**: Shows error message with support contact
- **Database Errors**: Logs errors and shows user-friendly messages

## Files Structure

### Core Payment Files:
- `src/lib/stripe.ts` - Stripe configuration
- `src/components/payment/SimpleCheckoutButton.tsx` - Payment button
- `src/app/payment-success/page.tsx` - Handles successful payments
- `src/app/payment-cancel/page.tsx` - Handles canceled payments

### Updated Pages:
- `src/app/dashboard/page.tsx` - Plan selection and upgrade buttons
- `src/app/settings/page.tsx` - Removed complex subscription management
- `src/app/stats/page.tsx` - Access control for free users

## Testing

### 1. **Test Cards**
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`

### 2. **Test Flow**
1. Create a new user account
2. Select free plan during onboarding
3. Click "Upgrade to Paid Plan" on dashboard
4. Complete payment with test card
5. Verify redirect to success page
6. Check database for plan update
7. Verify stats page access

### 3. **Test Scenarios**
- **Payment Success**: Should update plan and show success page
- **Payment Cancel**: Should show cancel page
- **Free User Access**: Should redirect from stats to dashboard
- **Paid User Access**: Should have full access to all features

## Security Considerations

### Current Implementation:
- ✅ User authentication required
- ✅ Payment data handled by Stripe
- ✅ Database updates only for authenticated users
- ⚠️ Payment verification relies on redirect URLs

### Recommended Improvements:
- Add payment verification on success page
- Implement webhooks for subscription management
- Add logging for payment events
- Set up monitoring for failed payments

## Production Deployment

### 1. **Environment Variables**
- Use production Stripe keys
- Set correct domain in payment link URLs
- Configure proper error handling

### 2. **Monitoring**
- Monitor payment success/failure rates
- Track user plan upgrades
- Set up alerts for database errors

### 3. **Backup Plan**
- Consider adding webhooks for critical events
- Implement manual plan management tools
- Set up customer support processes

## Troubleshooting

### Common Issues:
1. **Payment not updating plan**: Check database connection and user authentication
2. **Redirect not working**: Verify payment link URLs are correct
3. **User not found**: Ensure user is logged in before payment
4. **Database errors**: Check Supabase connection and table schema

### Debug Steps:
1. Check browser console for errors
2. Verify environment variables are set
3. Test payment link URLs manually
4. Check database for user records
5. Verify Stripe dashboard for payment status

## Next Steps

1. **Immediate**: Test the complete payment flow
2. **Short-term**: Add payment verification
3. **Medium-term**: Implement webhooks for subscription management
4. **Long-term**: Add advanced subscription features 