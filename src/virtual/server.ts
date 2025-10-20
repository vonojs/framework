export default (devEntry: string, build: boolean) => `
export * from 'nitro/runtime';
export * from 'nitro/h3';
import manifest from "virtual:vite-manifest"
export const manifest = manifest;
export const clientEntry = import.meta.env.DEV ? "${devEntry}" : "/" + Object.values(manifest).find(m => m.isEntry).file;
export const css = import.meta.env.DEV ? [] : Object.values(manifest).find(m => m.isEntry).css.map(c => "/"+c);
`