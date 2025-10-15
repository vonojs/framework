import { createBuilder } from "vite";
import {loadConfig,} from "c12";
import type {Vono} from "./mod.ts";
import {configure} from "./configure.ts";
export async function build() {

	const configFile = await loadConfig<Vono>({
		configFile: "vono.config",
	})

	const vono = configFile.layers![0].config!;

	configure(vono, "prod")

	const vite = await createBuilder(vono.config.vite)

	await vite.buildApp()
}
