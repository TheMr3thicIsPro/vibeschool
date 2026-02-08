import { NextRequest, NextResponse } from 'next/server';
import { getStripeServerClient } from '@/lib/stripe/client';

// Price IDs - you'll need to create these in your Stripe dashboard
const PRICE_IDS = {
  first_month: 'price_cNi4gz8g33ivg9c4hxeAg00',
  recurring: 'price_00w8wP0NB2ercX029peAg01'
};

console.log('[STRIPE] Initializing create-checkout-session route');

export async function POST(request: NextRequest) {
  console.log('[STRIPE] create-checkout-session called', { 
    hasSecret: !!process.env.STRIPE_SECRET_KEY,
    timestamp: new Date().toISOString()
  });

  try {
    // Get Stripe client with error handling
    const { client, error } = getStripeServerClient();
    
    if (error) {
      console.log('[STRIPE] create-checkout-session - returning config error');
      return error;
    }

    if (!client) {
      console.error('[STRIPE] create-checkout-session - No client available');
      return NextResponse.json(
        { error: 'Stripe client not available' },
        { status: 500 }
      );
    }

    const { userId, userEmail, planType } = await request.json();

    if (!userId || !userEmail || !planType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let priceId;
    let mode: 'subscription' | 'payment' = 'subscription';

    // For subscription, use both prices (first month + recurring)
    if (planType === 'subscription') {
      priceId = [PRICE_IDS.first_month, PRICE_IDS.recurring];
    } else {
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      );
    }

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID not configured for this plan type' },
        { status: 500 }
      );
    }

    const session = await client.checkout.sessions.create({
      customer_email: userEmail,
      payment_method_types: ['card'],
      line_items: priceId.map((price: string) => ({
        price,
        quantity: 1,
      })),
      mode,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payments`,
      client_reference_id: userId,
      metadata: {
        userId,
        planType,
      },
      subscription_data: planType === 'subscription' ? {
        trial_period_days: 3, // 3-day free trial
        metadata: {
          userId,
          planType,
        },
      } : undefined,
    });

    console.log('[STRIPE] Checkout session created successfully', { sessionId: session.id });

    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    console.error('[STRIPE] Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}