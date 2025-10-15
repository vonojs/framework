import fs from "node:fs/promises";
import type { Plugin } from "vite";

export function virtualManifest(): Plugin {
	let manifest = "{}";
	const id = "#vite-manifest";
	const resolvedId = `\0${id}`;
	return {
		name: "vono-manifest",
		applyToEnvironment(e) {
			return e.name === "nitro"
		},
		resolveId(possibleId) {
			if (possibleId === id) {
				return resolvedId
			}
		},
		load(id) {
			if (id === resolvedId) {
				return `export default ${manifest}`
			}
		},
		async buildStart(c) {
			manifest = await fs.readFile("./.output/public/.vite/manifest.json", "utf-8");
		},
	}
}