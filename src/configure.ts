import type {Vono} from "./mod.ts";
import {VonoEntryPoints} from "./entryPoints.ts";
import {virtualManifest} from "./manifestPlugin.ts";
import tsconfigPaths from "vite-tsconfig-paths";
import virtualServerFile from "./virtual/server.ts";
import {defaultRuntimes} from "./runtime/index.ts";
import defu from "defu";
import {nitro} from "nitro/vite"
import consola from "consola";
import {fileExists} from "./utils.ts";

export async function configure(vono: Vono, mode: "dev" | "prod") {
	vono.viteConfig({
		plugins: [
			vono.vfs.vitePlugin(),
			virtualManifest(),
			tsconfigPaths(),
		],
	})

	try {
		await vono.userConfigFunction?.(vono)
	} catch (e) {
		consola.error("Error in vono config function:", e)
		process.exit(1)
	}

	for(const plugin of vono.config.plugins) {
		try {
			await plugin(vono)
		} catch (e) {
			consola.error(`Error in plugin ${plugin.name}:`, e)
			process.exit(1)
		}
	}

	const entries = new VonoEntryPoints(vono.config.files)

	const serverEntry = entries.getServerEntry(mode)
	if(!serverEntry) {
		consola.error("No server entry found. Ensure that you have a server entry defined in your vono config.")
		process.exit(1)
	}

	const runtimes = {
		server: vono.config.runtimes.server[mode] ?? defaultRuntimes.server[mode],
		client: vono.config.runtimes.client[mode] ?? defaultRuntimes.client[mode],
		renderer: mode === "dev" ? (
			vono.config.runtimes.server.rendererDev ?? defaultRuntimes.server.rendererDev
		) : (
			vono.config.runtimes.server.rendererProd ?? defaultRuntimes.server.rendererProd
		),
	}

	const clientEntryPath = entries.getClientEntry(mode)?.path;
	const clientEntryExists = clientEntryPath ? await fileExists(clientEntryPath) : false;

	const rendererEntryPath = entries.getRendererEntry(mode)?.path;
	const rendererEntryExists = rendererEntryPath ? await fileExists(rendererEntryPath) : false;

	vono.viteConfig({
		build: {
			manifest: true,
			rolldownOptions: {
				output: {
					advancedChunks: {
						groups: [
							{
								test: /#vite-manifest/,
								name: "manifest",
							},
						]
					}
				}
			}
		},
		resolve: {
			alias: {
				"@vonojs/framework/server": "#vono/server",
				// bind USER entry points to aliased paths
				"@vonojs/framework/serverEntry": serverEntry.path,
				"@vonojs/framework/clientEntry": clientEntryExists ? clientEntryPath : "",
				"@vonojs/framework/rendererEntry": rendererEntryExists ? rendererEntryPath : "",
			},
		}
	})

	// set virtual server file to point to correct runtime
	vono.vfs.set(
		"server",
		virtualServerFile(runtimes.client,
		)
	)

	const nitroConfig = defu(vono.config.nitro, {
		devServer: {
			port: vono.config.port ?? 8000,
		},
		serverEntry: runtimes.server,
		routesDir: vono.config.apiRouteDirectory ?? "src/serverMain/routes",
		renderer: entries.getRendererEntry(mode) ? ({
			entry: runtimes.renderer
		}) : undefined,
	})

	vono.vitePlugins(nitro({ config: nitroConfig }))

	// if client entry is defined, use it as input for client build
	const clientEntry = entries.getClientEntry(mode)
	if(clientEntry && await fileExists(clientEntry.path)) {
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

	for (const afterConfigCallback of vono.afterConfigCallbacks) {
		try {
			await afterConfigCallback(vono)
		} catch (e) {
			consola.error(`Error in afterConfig callback ${afterConfigCallback.name}:`, e)
			process.exit(1)
		}
	}
}