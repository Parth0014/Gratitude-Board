import { Signal } from '@tldraw/state';
import { TLUserPreferences } from './TLUserPreferences';
/** @public */
export interface TLCurrentUser {
    readonly userPreferences: Signal<TLUserPreferences>;
    readonly setUserPreferences: (userPreferences: TLUserPreferences) => void;
}
/** @public */
export declare function createTLCurrentUser(opts?: {
    userPreferences?: Signal<TLUserPreferences>;
    setUserPreferences?: (userPreferences: TLUserPreferences) => void;
}): TLCurrentUser;
/**
 * @public
 */
export declare function useTldrawCurrentUser(opts: {
    userPreferences?: Signal<TLUserPreferences> | TLUserPreferences;
    setUserPreferences?: (userPreferences: TLUserPreferences) => void;
}): TLCurrentUser;
//# sourceMappingURL=createTLCurrentUser.d.ts.map