import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { supabase } from '@/lib/supabase';
import { createPurchase } from '@/services/payment/paymentService';

// Make sure to call this in a client component
let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      throw new Error('Stripe publishable key is not set');
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

// Create checkout session for subscription
export const createCheckoutSession = async (userId: string, userEmail: string, planType: 'trial' | 'subscription') => {
  try {
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        userEmail,
        planType,
      }),
    });

    const session = await response.json();
    
    if (!response.ok) {
      throw new Error(session.error || 'Failed to create checkout session');
    }

    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

// Handle successful payment
export const handleSuccessfulPayment = async (sessionId: string, userId: string) => {
  try {
    // Retrieve session to get plan details
    const response = await fetch(`/api/stripe/session?session_id=${sessionId}`);
    const session = await response.json();

    if (!response.ok) {
      throw new Error('Failed to retrieve session');
    }

    // Create purchase record
    const purchaseData = {
      product_type: session.planType === 'subscription' ? 'subscription' : ('trial' as 'subscription' | 'lifetime'),
      stripe_customer_id: session.customer,
      stripe_subscription_id: session.subscription || null,
      stripe_price_id: session.priceId,
      amount_cents: session.amount_total,
      currency: session.currency,
      status: 'active' as 'active' | 'canceled' | 'past_due' | 'unpaid',
    };

    await createPurchase(userId, purchaseData);

    return true;
  } catch (error) {
    console.error('Error handling successful payment:', error);
    throw error;
  }
};

// Cancel subscription
export const cancelSubscription = async (purchaseId: string, stripeSubscriptionId: string) => {
  try {
    const response = await fetch('/api/stripe/cancel-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionId: stripeSubscriptionId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to cancel subscription');
    }

    // Update local purchase record
    const { updatePurchase } = await import('@/services/payment/paymentService');
    await updatePurchase(purchaseId, {
      status: 'canceled',
      ended_at: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
};