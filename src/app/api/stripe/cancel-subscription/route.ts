import { NextRequest, NextResponse } from 'next/server';
import { getStripeServerClient } from '@/lib/stripe/client';

console.log('[STRIPE] Initializing cancel-subscription route');

export async function POST(request: NextRequest) {
  console.log('[STRIPE] cancel-subscription called', { 
    hasSecret: !!process.env.STRIPE_SECRET_KEY,
    timestamp: new Date().toISOString()
  });

  try {
    // Get Stripe client with error handling
    const { client, error } = getStripeServerClient();
    
    if (error) {
      console.log('[STRIPE] cancel-subscription - returning config error');
      return error;
    }

    if (!client) {
      console.error('[STRIPE] cancel-subscription - No client available');
      return NextResponse.json(
        { error: 'Stripe client not available' },
        { status: 500 }
      );
    }

    const { subscriptionId } = await request.json();

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    // Cancel the subscription
    const subscription = await client.subscriptions.cancel(subscriptionId);

    console.log('[STRIPE] Subscription canceled successfully', { 
      id: subscription.id, 
      status: subscription.status 
    });

    return NextResponse.json({
      id: subscription.id,
      status: subscription.status,
      canceled_at: subscription.canceled_at,
    });
  } catch (error: any) {
    console.error('[STRIPE] Error canceling subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}