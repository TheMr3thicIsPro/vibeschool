'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/context/AuthContext';
import { checkUserAccess, getUserPurchases } from '@/services/payment/paymentService';
import { createCheckoutSession, getStripe } from '@/services/stripe/stripeService';
import { CreditCard, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppShell from '@/components/layout/AppShell';

const PaymentsPage = () => {
  const { state } = useAuthStore();
  const user = state.user;
  const [userAccess, setUserAccess] = useState(false);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'plans' | 'history'>('plans');

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      if (user) {
        const access = await checkUserAccess(user.id);
        setUserAccess(access);
        
        const userPurchases = await getUserPurchases(user.id);
        setPurchases(userPurchases);
      }
    } catch (err) {
      console.error('Failed to fetch user data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Pricing data
  const pricingPlans = [
    {
      id: 'trial',
      name: 'Free Trial',
      price: '$0.00',
      period: 'first 3 days',
      currency: 'AUD',
      description: 'Try before you buy - no credit card required',
      features: [
        'Access to first 1-2 lessons of each course',
        'Preview premium content',
        'No payment information needed',
        'Easy upgrade anytime'
      ],
      popular: true
    },
    {
      id: 'subscription',
      name: 'Monthly Subscription',
      price: '$1.99',
      period: 'first month, then $7.99/month',
      currency: 'AUD',
      description: 'Access to all premium content',
      features: [
        'Full course library',
        'New modules and lessons',
        'Community access',
        'Priority support',
        'Cancel anytime'
      ]
    }
  ];

  const handleCheckout = async (planId: string) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Map plan IDs to our internal types
      const planType = planId === 'trial' ? 'trial' : 'subscription';
      
      // Create checkout session
      const session = await createCheckoutSession(
        user.id, 
        user.email!, 
        planType
      );
      
      // Redirect to Stripe checkout
      const stripe = await getStripe();
      if (!stripe) {
        console.error('Stripe failed to initialize');
        alert('Stripe is not available. Please try again later.');
        return;
      }
      
      const result = await stripe.redirectToCheckout({
        sessionId: session.sessionId
      });
      
      if (result.error) {
        console.error('Stripe checkout error:', result.error);
        alert('Error redirecting to checkout. Please try again.');
      }
      
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(`Error: ${error.message || 'Failed to initiate checkout'}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="flex items-center justify-center h-full">
            <div className="text-2xl font-bold text-accent-primary">Loading payment options...</div>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-2">Access Plans</h1>
            <p className="text-gray-400 mb-8">
              {userAccess 
                ? 'You have active access to premium content' 
                : 'Unlock premium content with one of our plans'}
            </p>

            {userAccess && (
              <div className="mb-8 p-4 bg-green-900/20 border border-green-700 rounded-lg flex items-center gap-3">
                <CheckCircle className="text-green-400" size={24} />
                <div>
                  <h3 className="font-semibold text-green-400">Active Access</h3>
                  <p className="text-green-300 text-sm">You currently have access to premium content</p>
                </div>
              </div>
            )}

            <div className="flex border-b border-gray-700 mb-8">
              <button
                className={`px-4 py-2 font-medium hover-lift ${
                  activeTab === 'plans'
                    ? 'text-accent-primary border-b-2 border-accent-primary'
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setActiveTab('plans')}
              >
                Pricing Plans
              </button>
              <button
                className={`px-4 py-2 font-medium hover-lift ${
                  activeTab === 'history'
                    ? 'text-accent-primary border-b-2 border-accent-primary'
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setActiveTab('history')}
              >
                Purchase History
              </button>
            </div>

            {activeTab === 'plans' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pricingPlans.map((plan) => (
                  <div 
                    key={plan.id}
                    className={`card p-6 border rounded-lg relative ${
                      plan.popular 
                        ? 'border-accent-primary ring-2 ring-accent-primary/30' 
                        : 'border-card-border'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-accent-primary text-white text-xs font-bold px-4 py-1 rounded-full border border-accent-primary">
                        MOST POPULAR
                      </div>
                    )}
                    
                    <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      {plan.id === 'subscription' && (
                        <div className="inline-block bg-gradient-to-r from-[#ff4d4d] to-[#f9cb28] text-black text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 uppercase tracking-wider shadow-[0_0_10px_rgba(255,77,77,0.3)]">
                          Limited Time Offer
                        </div>
                      )}
                      <div className="mb-2">
                        <span className="text-3xl font-bold text-white">{plan.price}</span>
                        <span className="text-gray-400"> {plan.period}</span>
                      </div>
                      <p className="text-gray-400 text-sm">{plan.currency}</p>
                    </div>
                    
                    <p className="text-gray-400 mb-6">{plan.description}</p>
                    
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-gray-300">
                          <CheckCircle className="text-accent-primary" size={16} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <button
                      onClick={() => handleCheckout(plan.id)}
                      disabled={userAccess && plan.id === 'trial'}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                        userAccess && plan.id === 'trial'
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          : plan.id === 'trial'
                          ? 'bg-green-600 text-white hover:bg-green-700 hover-lift'
                          : 'bg-accent-primary text-white hover:bg-accent-primary/90 hover-lift'
                      }`}
                    >
                      {userAccess && plan.id === 'trial' 
                        ? 'Trial Completed' 
                        : plan.id === 'trial'
                        ? 'Start Free Trial'
                        : `Subscribe Now`}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Purchase History</h2>
                
                {purchases.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="mx-auto text-gray-600 mb-4" size={48} />
                    <p className="text-gray-400">No purchase history yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {purchases.map((purchase) => (
                      <div key={purchase.id} className="card p-4 border border-card-border rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium text-white">
                              {purchase.product_type === 'lifetime' 
                                ? 'Lifetime Access' 
                                : purchase.product_type === 'subscription'
                                ? 'Monthly Subscription'
                                : 'Free Trial'}
                            </h3>
                            <p className="text-gray-400 text-sm">
                              {new Date(purchase.created_at).toLocaleDateString()} • {purchase.currency} {purchase.amount_cents / 100}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs ${
                            purchase.status === 'active' 
                              ? 'bg-green-900/30 text-green-400' 
                              : purchase.status === 'canceled'
                              ? 'bg-red-900/30 text-red-400'
                              : 'bg-yellow-900/30 text-yellow-400'
                          }`}>
                            {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                          </span>
                        </div>
                        
                        {purchase.ended_at && (
                          <p className="text-gray-500 text-xs mt-2">
                            Ends: {new Date(purchase.ended_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="mt-12 p-6 bg-card-bg border border-card-border rounded-lg">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Lock className="text-accent-primary" size={20} />
                Access Information
              </h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-gray-500 mt-0.5" />
                  <span>3-day free trial with no credit card required</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-gray-500 mt-0.5" />
                  <span>$1.99 for first month, then $7.99/month thereafter</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-gray-500 mt-0.5" />
                  <span>Full access unlocks after trial or subscription</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-gray-500 mt-0.5" />
                  <span>No refunds are available after purchase</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-gray-500 mt-0.5" />
                  <span>Cancel anytime during your subscription</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
};

export default PaymentsPage;