// features/plan-subscriptions/types/plan-subscription.type.ts

export interface PlanFeature {
  id: string;
  featureKey: string;
  featureName: string;
  featureValue: string;
  description: string | null;
}

export interface PricingPlan {
  id: string;
  code: string;
  name: string;
  description: string | null;
  priceMonth: number;
  priceYear: number;
  tier: number;
  isActive: boolean;
  sortOrder: number;
  features: PlanFeature[];
}

/** Base API envelope */
export interface ApiEnvelope {
  success: boolean;
  message: string;
  statusCode: number;
}

/** GET /api/v1/admin/plans */
export interface GetPlansResponse extends ApiEnvelope {
  data: PricingPlan[];
}

/** POST /api/v1/admin/plans */
export interface CreatePlanResponse extends ApiEnvelope {
  data: PricingPlan;
}

/** PUT /api/v1/admin/plans/{id} */
export interface UpdatePlanResponse extends ApiEnvelope {
  data: PricingPlan;
}

/** DELETE /api/v1/admin/plans/{id} */
export interface DeactivatePlanResponse extends ApiEnvelope {}

export type FeatureInput = {
  featureKey: string;
  featureName: string;
  featureValue: string;
  description: string | null;
};

export type CreatePlanPayload = {
  code: string;
  name: string;
  description: string;
  priceMonth: number;
  priceYear: number;
  tier: number;
  sortOrder: number;
  features: FeatureInput[];
};

export type UpdatePlanPayload = {
  code: string;
  tier: number;
  name: string;
  description: string;
  priceMonth: number;
  priceYear: number;
  isActive: boolean;
  sortOrder: number;
  features: FeatureInput[];
};
