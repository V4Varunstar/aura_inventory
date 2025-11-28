import { Company, SubscriptionPlan, SubscriptionStatus, PLAN_LIMITS } from '../types';

/**
 * Check if company can add more users
 */
export const canAddUser = (company: Company): boolean => {
  const limit = company.limits.maxUsers;
  if (limit === -1) return true; // unlimited
  return company.usage.users < limit;
};

/**
 * Check if company can add more warehouses
 */
export const canAddWarehouse = (company: Company): boolean => {
  const limit = company.limits.maxWarehouses;
  if (limit === -1) return true; // unlimited
  return company.usage.warehouses < limit;
};

/**
 * Check if company can add more products
 */
export const canAddProduct = (company: Company): boolean => {
  const limit = company.limits.maxProducts;
  if (limit === -1) return true; // unlimited
  return company.usage.products < limit;
};

/**
 * Check if subscription is active
 */
export const isSubscriptionActive = (company: Company): boolean => {
  return company.subscriptionStatus === SubscriptionStatus.Active ||
         company.subscriptionStatus === SubscriptionStatus.Trialing;
};

/**
 * Check if subscription is in trial
 */
export const isInTrial = (company: Company): boolean => {
  return company.subscriptionStatus === SubscriptionStatus.Trialing &&
         company.trialEndsAt &&
         new Date(company.trialEndsAt) > new Date();
};

/**
 * Get days remaining in trial
 */
export const getTrialDaysRemaining = (company: Company): number => {
  if (!company.trialEndsAt) return 0;
  const now = new Date().getTime();
  const trialEnd = new Date(company.trialEndsAt).getTime();
  const diff = trialEnd - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

/**
 * Get plan features
 */
export const getPlanFeatures = (plan: SubscriptionPlan): string[] => {
  return PLAN_LIMITS[plan]?.features || [];
};

/**
 * Check if company has feature access
 */
export const hasFeatureAccess = (company: Company, feature: string): boolean => {
  const features = getPlanFeatures(company.plan);
  return features.includes(feature);
};

/**
 * Get plan display name
 */
export const getPlanDisplayName = (plan: SubscriptionPlan): string => {
  const names = {
    [SubscriptionPlan.Free]: 'Free',
    [SubscriptionPlan.Starter]: 'Starter',
    [SubscriptionPlan.Pro]: 'Pro',
    [SubscriptionPlan.Business]: 'Business',
  };
  return names[plan] || plan;
};

/**
 * Get plan price
 */
export const getPlanPrice = (plan: SubscriptionPlan): number => {
  const prices = {
    [SubscriptionPlan.Free]: 0,
    [SubscriptionPlan.Starter]: 499,
    [SubscriptionPlan.Pro]: 999,
    [SubscriptionPlan.Business]: 1999,
  };
  return prices[plan] || 0;
};

/**
 * Calculate usage percentage
 */
export const calculateUsagePercentage = (current: number, limit: number): number => {
  if (limit === -1) return 0; // unlimited
  if (limit === 0) return 100;
  return Math.min(100, (current / limit) * 100);
};

/**
 * Check if usage is approaching limit
 */
export const isApproachingLimit = (current: number, limit: number, threshold: number = 0.8): boolean => {
  if (limit === -1) return false; // unlimited
  return current >= limit * threshold;
};

/**
 * Get recommended plan based on usage
 */
export const getRecommendedPlan = (company: Company): SubscriptionPlan | null => {
  const currentPlan = company.plan;
  const usage = company.usage;
  const limits = company.limits;

  // If current usage exceeds 80% of any limit, recommend upgrade
  if (limits.maxUsers !== -1 && usage.users >= limits.maxUsers * 0.8) {
    if (currentPlan === SubscriptionPlan.Free) return SubscriptionPlan.Starter;
    if (currentPlan === SubscriptionPlan.Starter) return SubscriptionPlan.Pro;
    if (currentPlan === SubscriptionPlan.Pro) return SubscriptionPlan.Business;
  }

  if (limits.maxWarehouses !== -1 && usage.warehouses >= limits.maxWarehouses * 0.8) {
    if (currentPlan === SubscriptionPlan.Starter) return SubscriptionPlan.Pro;
    if (currentPlan === SubscriptionPlan.Pro) return SubscriptionPlan.Business;
  }

  if (limits.maxProducts !== -1 && usage.products >= limits.maxProducts * 0.8) {
    if (currentPlan === SubscriptionPlan.Free) return SubscriptionPlan.Starter;
    if (currentPlan === SubscriptionPlan.Starter) return SubscriptionPlan.Pro;
    if (currentPlan === SubscriptionPlan.Pro) return SubscriptionPlan.Business;
  }

  return null; // No upgrade needed
};
