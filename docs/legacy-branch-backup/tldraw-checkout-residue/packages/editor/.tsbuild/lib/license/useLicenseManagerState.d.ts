import { LicenseFeatureName, LicenseManager, LicenseState } from './LicenseManager';
/** @internal */
export declare function useLicenseManagerState(licenseManager: LicenseManager): LicenseState;
/**
 * Reactively reads whether a licensable feature is enabled for the current license. Re-renders when
 * license validation resolves. Returns `false` when there is no license manager, so gated UI stays
 * hidden when mounted without an editor or license context.
 *
 * @internal
 */
export declare function useLicenseFeatureFlag(licenseManager: LicenseManager | null, feature: LicenseFeatureName): boolean;
//# sourceMappingURL=useLicenseManagerState.d.ts.map