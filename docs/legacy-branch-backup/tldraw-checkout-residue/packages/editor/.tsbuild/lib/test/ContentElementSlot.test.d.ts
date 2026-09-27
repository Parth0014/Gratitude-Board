declare const PERSISTENT_SHAPE_TYPE = "test-persistent";
declare module '@tldraw/tlschema' {
    interface TLGlobalShapePropsMap {
        [PERSISTENT_SHAPE_TYPE]: {
            w: number;
            h: number;
        };
    }
}
export {};
//# sourceMappingURL=ContentElementSlot.test.d.ts.map