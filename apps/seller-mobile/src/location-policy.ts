export type RouteActivationContext = {
  sellerApproved: boolean;
  consentAccepted: boolean;
  gpsCapabilityEnabled: boolean;
};

export function canActivateRealRoute(context: RouteActivationContext): boolean {
  return (
    context.sellerApproved &&
    context.consentAccepted &&
    context.gpsCapabilityEnabled
  );
}

export const locationPolicy = {
  backgroundUpdatesOnlyDuringRoute: true,
  publicPositionIsApproximate: true,
  persistentIndicatorRequired: true,
  foundationGpsEnabled: false,
} as const;

