// Ambient module declarations. This file must stay a script (no top-level
// import/export); module augmentations go in env.d.ts.

// Lets plain tsc resolve .vue imports from .ts files.
declare module '*.vue' {
    import type { DefineComponent } from 'vue';
    const component: DefineComponent;
    export default component;
}
