export default (devEntry: string, build: boolean) => `
export * from 'nitro/runtime';
export * from 'nitro/h3';
export const manifest = globalThis.__VITE_MANIFEST__;
export const clientEntry = import.meta.env.DEV ? "${devEntry}" : "/" + Object.values(manifest).find(m => m.isEntry).file;
export const css = import.meta.env.DEV ? [] : Object.values(manifest).find(m => m.isEntry).css.map(c => "/"+c);
`