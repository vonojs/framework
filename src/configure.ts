import type {Vono} from "./mod.ts";
import {VonoEntryPoints} from "./entryPoints.ts";
import {virtualManifest} from "./manifestPlugin.ts";
import tsconfigPaths from "vite-tsconfig-paths";
import virtualServerFile from "./virtual/server.ts";
import {defaultRuntimes} from "./runtime/index.ts";
import defu from "defu";
import {nitro} from "nitro/vite"

export function configure(vono: Vono, mode: "dev" | "prod") {
	const entries = new VonoEntryPoints(vono.config.files)

	const runtimes = {
		server: vono.config.runtimes.server[mode] ?? defaultRuntimes.server[mode],
		client: vono.config.runtimes.client[mode] ?? defaultRuntimes.client[mode],
		renderer: mode === "dev" ? (
			vono.config.runtimes.server.rendererDev ?? defaultRuntimes.server.rendererDev
		) : (
			vono.config.runtimes.server.rendererProd ?? defaultRuntimes.server.rendererProd
		),
	}

	const serverEntry = entries.getServerEntry(mode)
	if(!serverEntry) {
		throw new Error("No server entry found")
	}

	vono.viteConfig({
		build: {
			manifest: true,
		},
		plugins: [
			vono.vfs.vitePlugin(),
			virtualManifest(),
			tsconfigPaths(),
		],
		resolve: {
			alias: {
				"@vonojs/framework/server": "#vono/server",
				// bind USER entry points to aliased paths
				"@vonojs/framework/serverEntry": serverEntry.path,
				"@vonojs/framework/clientEntry": entries.getClientEntry(mode)?.path ?? "",
				"@vonojs/framework/rendererEntry": entries.getRendererEntry(mode)?.path ?? "",
			},
		}
	})

	// apply user config
	vono.userConfigFunction?.(vono)

	// set virtual server file to point to correct runtime
	vono.vfs.set(
		"server",
		virtualServerFile(runtimes.client,
		)
	)

	const nitroConfig = defu(vono.config.nitro, {
		devServer: {
			port: 8000,
		},
		serverEntry: runtimes.server,
		routesDir: vono.config.apiRouteDirectory ?? "src/serverMain/routes",
		renderer: entries.getRendererEntry(mode) ? ({
			entry: runtimes.renderer
		}) : undefined,
	})

	vono.vitePlugin(nitro({ config: nitroConfig }))

	// if client entry is defined, use it as input for client build
	const clientEntry = entries.getClientEntry(mode)
	if(clientEntry) {
		vono.viteConfig({
			environments: {
				client: {
					build: {
						rolldownOptions: {
							input: runtimes.client
						}
					},
					consumer: "client",
				},
			}
		})
	}
}