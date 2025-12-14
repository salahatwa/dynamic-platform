export interface Subscription {
  id: number;
  corporateId: number;
  tier: SubscriptionTier;
  maxApps: number;
  maxUsers: number;
  maxApiRequestsPerMonth: number;
  features: Record<string, any>;
  status: SubscriptionStatus;
  startedAt: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // Helper flags
  isUnlimitedApps: boolean;
  isUnlimitedUsers: boolean;
  isUnlimitedApiRequests: boolean;
  isActive: boolean;
}

export enum SubscriptionTier {
  FREE = 'FREE',
  PRO = 'PRO',
  TEAM = 'TEAM',
  ENTERPRISE = 'ENTERPRISE'
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  SUSPENDED = 'SUSPENDED'
}

export interface UsageLimits {
  subscription: Subscription;
  currentApps: number;
  currentUsers: number;
  currentApiRequests: number;
  canCreateApp: boolean;
  canAddUser: boolean;
  canMakeApiRequest: boolean;
  percentageUsed: {
    apps: number;
    users: number;
    apiRequests: number;
  };
}

export interface TierInfo {
  tier: SubscriptionTier;
  name: string;
  price: string;
  maxApps: number | string;
  maxUsers: number | string;
  maxApiRequests: number | string;
  features: string[];
  popular?: boolean;
}

export const TIER_INFO: Record<SubscriptionTier, TierInfo> = {
  [SubscriptionTier.FREE]: {
    tier: SubscriptionTier.FREE,
    name: 'Free',
    price: '$0',
    maxApps: 1,
    maxUsers: 2,
    maxApiRequests: '1,000',
    features: [
      '1 Application',
      '2 Users',
      '1,000 API requests/month',
      'Basic translations',
      'Basic templates',
      'Community support'
    ]
  },
  [SubscriptionTier.PRO]: {
    tier: SubscriptionTier.PRO,
    name: 'Pro',
    price: '$19',
    maxApps: 10,
    maxUsers: 'Unlimited',
    maxApiRequests: '50,000',
    features: [
      'Up to 10 Applications',
      'Unlimited languages',
      'Unlimited templates',
      'API Keys',
      'Error Codes Management',
      'App Configuration',
      'LOV Management',
      'Priority email support',
      'Export to JSON',
      '50,000 API requests/month'
    ],
    popular: true
  },
  [SubscriptionTier.TEAM]: {
    tier: SubscriptionTier.TEAM,
    name: 'Team',
    price: '$99',
    maxApps: 'Unlimited',
    maxUsers: 50,
    maxApiRequests: '500,000',
    features: [
      'Everything in Pro',
      '10-50 Users',
      'Roles & Permissions',
      'Activity logging',
      'Custom domains',
      'Multi-environment (dev/stage/prod)',
      'Advanced analytics',
      'Webhook integrations',
      'Priority support',
      '500,000 API requests/month'
    ]
  },
  [SubscriptionTier.ENTERPRISE]: {
    tier: SubscriptionTier.ENTERPRISE,
    name: 'Enterprise',
    price: 'Custom',
    maxApps: 'Unlimited',
    maxUsers: 'Unlimited',
    maxApiRequests: 'Unlimited',
    features: [
      'Unlimited everything',
      'SSO / SAML',
      'Dedicated account manager',
      'On-premise deployment',
      'Enhanced security',
      '99.9% SLA',
      'Custom integrations',
      'Training & onboarding',
      '24/7 phone support',
      'Unlimited API requests'
    ]
  }
};
