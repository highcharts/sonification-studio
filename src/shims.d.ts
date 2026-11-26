// Ambient module declarations. This file must stay a script (no top-level
// import/export); module augmentations go in env.d.ts.

// mathjs 7 has no bundled types (the deprecated @types/mathjs package was
// dropped). Only evaluate() is used. Delete this when upgrading to a mathjs
// version that ships its own types (11+).
declare module 'mathjs' {
    export function evaluate(expr: string, scope?: object): any;
}
