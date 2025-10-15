import {type UserConfig as ViteConfig} from "vite"
import defu from "defu";
import {VirtualFileSystem} from "./vfs.ts";
import type {NitroPluginConfig} from "nitro/vite";

type BuildTarget = string;

interface VonoConfig {
	vite: ViteConfig
	nitro: NitroPluginConfig
	plugins?: Array<(vono: Vono) => void>
	entries: {
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
	}
}

export type VonoPlugin = (vono: Vono) => void

export class Vono {
	constructor(public readonly userConfigFunction?: (vono: Vono) => void) {}

	readonly config: VonoConfig = {
		nitro: {
			config: {}
		},
		vite: {
			plugins: [],
		},
		entries: {
			client: {},
			server: {},
		}
	}

	plugin(plugin: (vono: Vono) => void) {
		this.config.plugins?.push(plugin)
	}

	readonly buildFor = (output: BuildTarget, options: any) => {
		this.config.nitro.config.preset = output
		this.config.nitro.config = defu(this.config.nitro.config, options)
	}

	readonly vitePlugin = (plugins: ViteConfig["plugins"]) => {
		this.config.vite.plugins!.push(plugins)
	}

	readonly viteConfig = (config: ViteConfig) => {
		this.config.vite = defu(this.config.vite, config)
	}

	readonly nitroConfig = (config: NitroPluginConfig) => {
		this.config.nitro = defu(this.config.nitro, config)
	}

	readonly serverMain = (path: string) => {
		this.config.entries.server.main = path
	}

	readonly serverDevMain = (path: string) => {
		this.config.entries.server.devMain = path
	}

	readonly serverProdMain = (path: string) => {
		this.config.entries.server.prodMain = path
	}

	readonly clientMain = (path: string) => {
		this.config.entries.client.main = path
	}

	readonly clientDevMain = (path: string) => {
		this.config.entries.client.devMain = path
	}

	readonly clientProdMain = (path: string) => {
		this.config.entries.client.prodMain = path
	}

	readonly serverRenderer = (path: string) => {
		this.config.entries.server.renderer = path
	}

	readonly serverDevRenderer = (path: string) => {
		this.config.entries.server.devRenderer = path
	}

	readonly serverProdRenderer = (path: string) => {
		this.config.entries.server.prodRenderer = path
	}

	readonly setVirtualFile = (id: string, code: string | (() => string | Promise<string>)) => {
		this.vfs.set(id, code)
	}

	readonly vfs = new VirtualFileSystem()
}

