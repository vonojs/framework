declare module "@vonojs/framework/server" {
	export * from "nitro/h3"
	export * from "nitro/runtime"
	export const css: string[]
	export const clientEntry: string
	export const manifest: import("vite").Manifest
}