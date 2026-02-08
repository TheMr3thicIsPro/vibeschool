import { supabase } from '@/lib/supabase';

// Create a new purchase record
export const createPurchase = async (userId: string, purchaseData: { 
  product_type: 'subscription' | 'lifetime'; 
  stripe_customer_id: string; 
  stripe_subscription_id?: string; 
  stripe_price_id: string; 
  amount_cents: number; 
  currency: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
}) => {
  const { data, error } = await supabase
    .from('purchases')
    .insert([{
      user_id: userId,
      ...purchaseData,
      started_at: new Date().toISOString(),
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update a purchase record
export const updatePurchase = async (purchaseId: string, updateData: Partial<{
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  ended_at: string;
  stripe_subscription_id: string;
}>) => {
  const { data, error } = await supabase
    .from('purchases')
    .update({
      ...updateData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', purchaseId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get user's active purchase
export const getUserActivePurchase = async (userId: string) => {
  const { data, error } = await supabase
    .from('purchases')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['active', 'past_due'])
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) throw error;
  return data[0] || null;
};

// Check if user has access (lifetime or active subscription)
export const checkUserAccess = async (userId: string) => {
  const purchase = await getUserActivePurchase(userId);
  
  if (!purchase) return false;
  
  // Lifetime access always grants access
  if (purchase.product_type === 'lifetime') return true;
  
  // For subscriptions, check if it's still active and not expired
  if (purchase.status === 'active') {
    if (!purchase.ended_at) return true; // No end date means still active
    
    const endDate = new Date(purchase.ended_at);
    const now = new Date();
    
    return now <= endDate;
  }
  
  return false;
};

// Get user's purchase history
export const getUserPurchases = async (userId: string) => {
  const { data, error } = await supabase
    .from('purchases')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Cancel a subscription (update purchase status)
export const cancelSubscription = async (purchaseId: string) => {
  const { data, error } = await supabase
    .from('purchases')
    .update({
      status: 'canceled',
      ended_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', purchaseId)
    .select()
    .single();

  if (error) throw error;
  return data;
};