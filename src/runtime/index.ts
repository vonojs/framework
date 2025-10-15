import {resolveThisDir} from "../utils.ts";
import path from "node:path";

export const runtimeDirectory = resolveThisDir(import.meta.url);

export const defaultRuntimes =  {
	client: {
		dev: path.join(runtimeDirectory, "dev", "client.ts"),
			prod: path.join(runtimeDirectory, "prod", "client.ts")
	},
	server: {
		dev: path.join(runtimeDirectory, "dev", "server.ts"),
			prod: path.join(runtimeDirectory, "prod", "server.ts"),
			rendererDev: path.join(runtimeDirectory, "dev", "renderer.ts"),
			rendererProd: path.join(runtimeDirectory, "prod", "renderer.ts"),
	},
}