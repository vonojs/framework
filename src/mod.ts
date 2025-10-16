import {type PluginOption, type UserConfig as ViteConfig} from "vite"
import defu from "defu";
import {VirtualFileSystem} from "./vfs.ts";
import type {NitroPluginConfig} from "nitro/vite";

export const BuildTarget = {
	Node : undefined, // default, no value
	NodeHandler: "node",
	Deno: "deno",
	Bun: "bun",
	Cloudflare: "cloudflare-module",
	Netlify: "netlify",
	DenoDeploy: "deno_deploy",
	Azure: "azure",
	AWSLambda: "aws_lambda",
	Vercel: "vercel",
}

type BuildTarget = typeof BuildTarget[keyof typeof BuildTarget]

interface VonoConfig {
	vite: ViteConfig
	nitro: NonNullable<NitroPluginConfig["config"]>
	plugins: Array<VonoPlugin>
	apiRouteDirectory?: string,
	port?: number,
	files: {
		client: {
			main?: string,
			devMain?: string,
			prodMain?: string,
		},
		server: {
			main?: string,
			devMain?: string,
			prodMain?: string,
			renderer?: string,
			devRenderer?: string,
			prodRenderer?: string,
		},
	},
	runtimes: {
		client: {
			dev?: string,
			prod?: string,
		},
		server: {
			dev?: string,
			prod?: string,
			rendererDev?: string,
			rendererProd?: string,
		}
	}
}

export type VonoPlugin = (vono: Vono) => void | Promise<void>;

export class Vono {
	constructor(public readonly userConfigFunction?: (vono: Vono) => Promise<void> | void) {}

	readonly config: VonoConfig = {
		plugins: [],
		nitro: {},
		vite: {
			plugins: [],
		},
		files: {
			client: {},
			server: {},
		},
		runtimes: {
			client: {},
			server: {},
		}
	}

	readonly BuildTarget = BuildTarget

	/**
	 * Add a vono plugin to the config.
	 * @param plugin
	 */
	plugin = (plugin: (vono: Vono) => void) => {
		this.config.plugins?.push(plugin)
	}

	/**
	 * Set the build target for the server.
	 * @param target - {@link BuildTarget}
	 * @param options
	 */
	readonly buildFor = (target: BuildTarget, options?: any) => {
		this.config.nitro.preset = target
		this.config.nitro = defu(this.config.nitro!, options ?? {})
	}

	readonly vitePlugins = (...plugins: PluginOption[]) => {
		this.config.vite.plugins!.push(plugins)
	}

	readonly viteConfig = (config: ViteConfig) => {
		this.config.vite = defu(this.config.vite, config)
	}

	readonly nitroConfig = (config: NitroPluginConfig["config"]) => {
		this.config.nitro = defu(this.config.nitro, config)
	}

	readonly serverMain = (path: string) => {
		this.config.files.server.main = path
	}

	readonly serverDevMain = (path: string) => {
		this.config.files.server.devMain = path
	}

	readonly serverProdMain = (path: string) => {
		this.config.files.server.prodMain = path
	}

	readonly clientMain = (path: string) => {
		this.config.files.client.main = path
	}

	readonly clientDevMain = (path: string) => {
		this.config.files.client.devMain = path
	}

	readonly clientProdMain = (path: string) => {
		this.config.files.client.prodMain = path
	}

	readonly serverRenderer = (path: string) => {
		this.config.files.server.renderer = path
	}

	readonly serverDevRenderer = (path: string) => {
		this.config.files.server.devRenderer = path
	}

	readonly serverProdRenderer = (path: string) => {
		this.config.files.server.prodRenderer = path
	}

	readonly virtualFile = (id: string, code: string | (() => string | Promise<string>)) => {
		this.vfs.set(id, code)
	}

	readonly runtimes = (fn: (runtimes: VonoConfig["runtimes"]) => void) => {
		fn(this.config.runtimes)
	}

	readonly apiRouteDirectory = (path: string) => {
		this.config.apiRouteDirectory = path
	}

	readonly port = (port: number) => {
		this.config.port = port
	}

	readonly afterConfiguration = (afterConfigCallback: VonoPlugin) => {
		this.afterConfigCallbacks.add(afterConfigCallback)
	}

	readonly vfs = new VirtualFileSystem()

	afterConfigCallbacks = new Set<VonoPlugin>
}

