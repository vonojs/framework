import consola from "consola";
import {createServer, type UserConfig, type ViteDevServer} from "vite";
import { watchConfig} from "c12";
import type {Vono} from "./mod.ts";
import {configure} from "./configure.ts";

export async function dev() {
	const vite = new ViteDevInstance()

	async function init(configFile: any) {
		const vono = configFile.layers![0].config!;
		configure(vono, "dev")
		await vite.create(vono.config.vite)
	}

	const configFile = await watchConfig<Vono>({
		configFile: "vono.config",
		onUpdate: async ({ newConfig }) => {
			await init(newConfig)
		}
	})

	await init(configFile)
}

class ViteDevInstance {
	async create(config: UserConfig) {
		if(this.server) {
			await this.server.close()
		}
		this.server = await createServer(config)
		await this.server.listen()
		consola.info("Vite server started")
	}
	server?: ViteDevServer
}

