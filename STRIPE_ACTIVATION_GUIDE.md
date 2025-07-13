# Stripe Payment Activation Guide

## Overview

Your application is currently configured with a **free access mode** that grants all users full access without payment. Once you receive your EIN number on July 15th, you can activate Stripe payments by following this guide.

## Current Status

✅ **Stripe Architecture**: Fully implemented and ready  
✅ **Feature Flags**: Payment system disabled via config  
✅ **Free Access**: All new users get `has_access: true`  
✅ **UI Updates**: Payment flows hidden, free messaging shown  

## Prerequisites

Before activating payments, ensure you have:

1. **EIN Number** (required for Stripe business account)
2. **Business Bank Account** 
3. **Stripe Account** verified and activated
4. **Domain Verification** for your Stripe account

## Step-by-Step Activation

### 1. Stripe Account Setup

1. **Complete Stripe Verification**
   - Log into your [Stripe Dashboard](https://dashboard.stripe.com)
   - Complete business verification with your EIN
   - Add your business bank account
   - Verify your domain (`app.folyx.me`)

2. **Create Production Products**
   - Go to Products in your Stripe Dashboard
   - Create your subscription plans:
     - **Starter Plan**: $19/month
     - **Pro Plan**: $49/month
   - Copy the production price IDs

### 2. Update Configuration Files

#### A. Update Production Price IDs in `application/config.js`

```javascript
stripe: {
  plans: [
    {
      priceId: process.env.NODE_ENV === "development"
        ? "price_1Niyy5AxyNprDp7iZIqEyD2h"  // Keep dev price
        : "price_YOUR_PRODUCTION_STARTER_ID", // Replace with real production price
      name: "Starter",
      // ... rest of plan config
    },
    {
      priceId: process.env.NODE_ENV === "development"
        ? "price_1O5KtcAxyNprDp7iftKnrrpw"  // Keep dev price  
        : "price_YOUR_PRODUCTION_PRO_ID",    // Replace with real production price
      name: "Pro",
      // ... rest of plan config
    },
  ],
},
```

#### B. Enable Payments in `application/config.js`

```javascript
payments: {
  // FEATURE FLAG: Set to true to enable Stripe payments
  enabled: true,  // ⬅️ Change this from false to true
  // When payments are disabled, all users get full access without paying
  freeAccessMode: false,  // ⬅️ Change this from true to false
},
```

### 3. Environment Variables

Set these environment variables in your production deployment:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Supabase (should already be set)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Stripe Webhook Configuration

1. **Create Production Webhook**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://app.folyx.me/api/webhook/stripe`
   - Select these events:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

2. **Copy Webhook Secret**
   - After creating the webhook, copy the signing secret
   - Add it to your environment variables as `STRIPE_WEBHOOK_SECRET`

### 5. Customer Portal Activation

1. Go to Stripe Dashboard → Settings → Billing
2. Enable Customer Portal
3. Configure allowed features:
   - ✅ Update payment method
   - ✅ View invoice history
   - ✅ Cancel subscription
   - ✅ Update billing details

### 6. Database Migration

Run this SQL in your Supabase SQL editor to update existing users:

```sql
-- Update existing free users to require payment
-- (Only run this when you're ready to start charging)
UPDATE profiles 
SET has_access = false 
WHERE plan_type = 'free' 
AND customer_id IS NULL;

-- Optional: Grandfather existing users with free access
-- (Keep existing users free, only charge new signups)
-- Don't run the above UPDATE if you want to grandfather existing users
```

### 7. Testing Before Going Live

1. **Test Development Environment**
   - Set `payments.enabled = true` in dev
   - Test full payment flow with Stripe test cards
   - Verify webhook handling
   - Test user provisioning and access control

2. **Test Production Environment** 
   - Deploy changes to production
   - Test with real payment methods (small amounts)
   - Verify email notifications work
   - Test subscription management

### 8. Go Live Checklist

- [ ] Stripe account fully verified with EIN
- [ ] Production price IDs updated in config
- [ ] Environment variables set in production
- [ ] Webhook endpoint configured and tested
- [ ] Customer portal activated
- [ ] Payment flow tested end-to-end
- [ ] Database migration planned (if needed)
- [ ] Support documentation updated
- [ ] User communication prepared (if grandfathering existing users)

## What Changes When Activated

### For New Users
- Must pay to access features
- Redirect to Stripe checkout on signup
- Access granted only after successful payment

### For Existing Users  
**Option A - Grandfather Existing Users:**
- Keep existing users with free access
- Only new signups require payment

**Option B - Require Payment from All:**
- All users must pay to continue access
- Send notification email before enforcement
- Provide grace period for transition

### UI Changes
- Pricing pages show actual prices instead of "FREE"
- Dashboard shows subscription status and billing options
- Account menu includes billing portal access
- Upgrade prompts appear for free users

## Rollback Plan

If issues arise, you can instantly disable payments:

```javascript
// In application/config.js
payments: {
  enabled: false,        // ⬅️ Disable payments
  freeAccessMode: true,  // ⬅️ Grant free access again
},
```

This immediately:
- Grants all users full access
- Hides payment UI
- Disables Stripe API calls
- Shows "free access" messaging

## Support Considerations

### Customer Support
- Update support documentation for billing issues
- Train team on subscription management
- Set up billing dispute process
- Create refund policy and procedures

### Technical Monitoring
- Monitor Stripe webhook delivery
- Set up alerts for failed payments
- Track subscription churn metrics
- Monitor user access provisioning

## Security Notes

- Never commit production Stripe keys to git
- Use environment variables for all secrets
- Regularly rotate webhook secrets
- Monitor for unauthorized webhook calls
- Implement proper error handling for failed payments

## Need Help?

If you encounter issues during activation:

1. **Stripe Documentation**: https://stripe.com/docs
2. **Webhook Testing**: Use Stripe CLI for local testing
3. **Error Logs**: Check both application and Stripe dashboard logs
4. **Test Mode**: Always test thoroughly before going live

---

**Remember**: The architecture is already in place. Activation is just a configuration change once your business setup is complete!