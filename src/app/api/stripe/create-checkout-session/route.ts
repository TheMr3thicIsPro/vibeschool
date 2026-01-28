import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

// Price IDs - you'll need to create these in your Stripe dashboard
const PRICE_IDS = {
  first_month: 'price_cNi4gz8g33ivg9c4hxeAg00',
  recurring: 'price_00w8wP0NB2ercX029peAg01'
};

export async function POST(request: NextRequest) {
  try {
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

    const session = await stripe.checkout.sessions.create({
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

    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}