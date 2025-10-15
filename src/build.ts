import { createBuilder } from "vite";
import {loadConfig,} from "c12";
import type {Vono} from "./mod.ts";
import {configure} from "./configure.ts";
import consola from "consola";

export async function build() {
	consola.info("Building vono app")
	const configFile = await loadConfig<Vono>({
		configFile: "vono.config",
	})

	const vono = configFile.layers![0].config!;

	if(!vono || !("config" in vono)) {
		consola.error("Vono config not found. Ensure you have a `vono.config.{ts|js}` file in your current working directory, which exports a Vono instance as default.")
		consola.info(`See https://github.com/vonojs/framework for more information.`)
		process.exit(1)
	}

	await configure(vono, "prod")

	const vite = await createBuilder(vono.config.vite)

	await vite.buildApp()

	console.log("")
	consola.success("Build completed")
}
