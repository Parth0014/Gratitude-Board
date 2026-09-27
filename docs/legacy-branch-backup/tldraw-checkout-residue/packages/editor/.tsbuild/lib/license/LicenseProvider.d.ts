import { ReactNode } from 'react';
import { LicenseManager } from './LicenseManager';
/** @internal */
export declare const LicenseContext: import("react").Context<LicenseManager | null>;
/** @internal */
export declare function useLicenseContext(): LicenseManager;
/**
 * Returns the license manager for the current editor, or `null` if there is none. Reads the
 * license context when inside `<TldrawEditor />`, and otherwise falls back to the license manager
 * of the nearest editor, so UI mounted outside the editor tree (via `EditorProvider`) resolves the
 * same license as the editor it belongs to.
 *
 * @internal
 */
export declare function useMaybeLicenseManager(): LicenseManager | null;
/** @internal */
export declare const LICENSE_TIMEOUT = 5000;
/** @internal */
export declare function LicenseProvider({ licenseKey, children, }: {
    licenseKey?: string;
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=LicenseProvider.d.ts.map