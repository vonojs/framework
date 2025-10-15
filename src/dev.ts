import consola from "consola";
import {createServer, type UserConfig, type ViteDevServer} from "vite";
import { watchConfig} from "c12";
import type {Vono} from "./mod.ts";
import tailwindcss from "@tailwindcss/vite";
import {virtualManifest} from "./manifestPlugin.ts";
import tsconfigPaths from "vite-tsconfig-paths";
import {VonoEntryPoints} from "./entryPoints.ts";
import defu from "defu";
import {nitro} from "nitro/vite";
import virtualServerFile from "./virtual/server.ts"
import virtualRendererFile from "./virtual/renderer.ts"
import virtualServerMainFile from "./virtual/serverMain.ts"
import {runtimeDirectory} from "./runtime";
import path from "node:path";

export async function dev() {
	const vite = new ViteDevInstance()

	async function init(configFile: any) {
		const vono = configFile.layers![0].config!;
		vono.userConfigFunction?.(vono)
		configure(vono)
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

function configure(vono: Vono) {
	const entries = new VonoEntryPoints(vono.config.entries)

	const serverEntry = entries.getServerEntry("dev")
	if(!serverEntry) {
		throw new Error("No server entry found")
	}

	// server virtual file, for exports like
	// css and clientEntry
	// alias @vono/framework/server to #vono/server
	vono.vfs.set("server", virtualServerFile(entries.getClientEntry("dev")?.path ?? ""))
	// set serverEntry virtual file (wraps server entry)
	vono.vfs.set("serverMain", virtualServerMainFile(serverEntry.path))

	// renderer virtual file (wraps renderer entry)
	if(entries.getRendererEntry("dev")) {
		vono.vfs.set("rendererMain", virtualRendererFile(entries.getRendererEntry("dev")!.path))
	}

	vono.viteConfig({
		build: {
			manifest: true,
		},
		plugins: [
			vono.vfs.vitePlugin(),
			virtualManifest(),
			tsconfigPaths(),
			tailwindcss(),
		],
		resolve: {
			alias: {
				"@vonojs/framework/server": "#vono/server",
			}
		}
	})

	// apply user config
	vono.userConfigFunction?.(vono)

	const nitroConfig = defu(vono.config.nitro, {
		devServer: {
			port: 8000,
		},
		serverEntry: path.join(runtimeDirectory, "serverMain.ts"),
		routesDir: "src/serverMain/routes",
		renderer: entries.getRendererEntry("dev") ? ({
			entry: path.join(runtimeDirectory, "renderer.ts"),
		}) : undefined,
	})

	vono.vitePlugin(nitro({ config: nitroConfig }))

	// if client entry is defined, use it as input for client build
	const clientEntry = entries.getClientEntry("dev")
	if(clientEntry) {
		vono.viteConfig({
			environments: {
				client: {
					build: {
						rolldownOptions: {
							input: clientEntry.path
						}
					},
					consumer: "client",
				},
			}
		})
	}
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

