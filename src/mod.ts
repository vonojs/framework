import {type UserConfig as ViteConfig} from "vite"
import defu from "defu";
import {VirtualFileSystem} from "./vfs.ts";
import type {NitroPluginConfig} from "nitro/vite";

type BuildTarget = string;

interface VonoConfig {
	vite: ViteConfig
	nitro: NonNullable<NitroPluginConfig["config"]>
	plugins: Array<(vono: Vono) => void>
	apiRouteDirectory?: string,
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

export type VonoPlugin = (vono: Vono) => void

export class Vono {
	constructor(public readonly userConfigFunction?: (vono: Vono) => void) {}

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

	plugin = (plugin: (vono: Vono) => void) => {
		this.config.plugins?.push(plugin)
	}

	readonly buildFor = (output: BuildTarget, options?: any) => {
		this.config.nitro.preset = output
		this.config.nitro = defu(this.config.nitro!, options ?? {})
	}

	readonly vitePlugin = (plugins: ViteConfig["plugins"]) => {
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

	readonly vfs = new VirtualFileSystem()
}

