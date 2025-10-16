export default (devEntry: string) => `
import manifest from "virtual:vite-manifest"
export const clientEntry = import.meta.env.DEV ? "${devEntry}" : "/" + Object.values(manifest).find(m => m.isEntry).file;
export const css = import.meta.env.DEV ? [] : Object.values(manifest).find(m => m.isEntry).css.map(c => "/"+c);
`