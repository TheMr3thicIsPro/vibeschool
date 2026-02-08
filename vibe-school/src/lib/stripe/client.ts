import { NextResponse } from 'next/server';
import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

/**
 * Gets the Stripe client instance, initializing it if needed.
 * This ensures the Stripe client is only created when actually needed (at request time),
 * preventing build failures when environment variables are not available.
 */
export function getStripeServerClient(): { client: Stripe | null; error?: NextResponse } {
  // Check if we have the required environment variable
  const secretKey = process.env.STRIPE_SECRET_KEY;
  
  if (!secretKey) {
    console.log('[STRIPE] Missing STRIPE_SECRET_KEY environment variable');
    return {
      client: null,
      error: NextResponse.json(
        { error: 'Stripe configuration is not available' },
        { status: 500 }
      )
    };
  }

  // Return existing client if already initialized
  if (stripeClient) {
    return { client: stripeClient };
  }

  // Initialize the client
  try {
    stripeClient = new Stripe(secretKey, {
      apiVersion: '2025-12-15.clover',
    });
    console.log('[STRIPE] Server client initialized successfully');
    return { client: stripeClient };
  } catch (error) {
    console.error('[STRIPE] Error initializing Stripe client:', error);
    return {
      client: null,
      error: NextResponse.json(
        { error: 'Failed to initialize Stripe client' },
        { status: 500 }
      )
    };
  }
}

/**
 * Validates that required Stripe environment variables are set
 */
export function validateStripeEnv(): boolean {
  const hasSecretKey = !!process.env.STRIPE_SECRET_KEY;
  console.log('[STRIPE] Environment validation', { 
    hasSecretKey,
    timestamp: new Date().toISOString()
  });
  return hasSecretKey;
}