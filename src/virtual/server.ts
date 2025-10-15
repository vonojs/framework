export default (devEntry: string) => `
import manifest from "#vite-manifest"
export const clientEntry = import.meta.env.DEV ? "${devEntry}" : manifest["${devEntry}"].file;
export const css = import.meta.env.DEV ? [] : manifest["${devEntry}"].css;
`