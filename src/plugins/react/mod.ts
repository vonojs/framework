import type { VonoPlugin } from "../../mod.ts";
import react, { type Options } from "@vitejs/plugin-react";
import path from "node:path";
import {reactRuntimeDirectory} from "./runtime";

/**
 * Requires `react-refresh`, `react`, `react-dom` and `@vitejs/plugin-react` to be installed
 * Optionally, install `@types/react` and `@types/react-dom`
 * @param config
 */
const reactPlugin = (config?: Options): VonoPlugin => ({ runtimes, vitePlugin }) => {
	vitePlugin(react(config))
	runtimes(x => {
		x.client.dev = path.join(reactRuntimeDirectory, "clientDev")
		x.client.prod = path.join(reactRuntimeDirectory, "clientProd")
	})
};

export default reactPlugin;