declare module "@vonojs/framework/serverEntry" {
	const handler: import("nitro/h3").EventHandler
	export default handler
}

declare module "@vonojs/framework/rendererEntry" {
	const handler: import("nitro/types").RenderHandler
	export default handler
}

declare module "@vonojs/framework/clientEntry" {}

declare module "@vonojs/framework/server" {
	export * from "nitro/h3"
	export * from "nitro/runtime"
	export const css: string[]
	export const clientEntry: string
}