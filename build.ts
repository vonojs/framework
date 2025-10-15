import * as esbuild from "esbuild"
import * as fs from "fs/promises"

let replaceTsExt = (path: string) =>
	path.endsWith(".ts") ? path.replace(".ts", "") + ".js" : path

export let build = async (args: { defines: Record<string, any>, drop: string[] }) => {
	await esbuild.build({
		entryPoints: ["src/**/*.ts"],
		bundle: true,
		outdir: "dist",
		format: "esm",
		platform: "node",
		define: args.defines,
		dropLabels: args.drop,
		treeShaking: true,
		target: ["es2022"],
		plugins: [{
			name: 'resolve-ext',
			setup(build) {
				build.onResolve({ filter: /.*/ }, args => {
					if (args.importer){
						return {
							path: replaceTsExt(args.path),
							external: true
						}
					} else {
						return { path: args.path, external: true }
					}
				})
			},
		}],
	})
}

await fs.rm("dist", { recursive: true, force: true })

console.info(`Building...`)

let t = performance.now()

await build({
	defines: {},
	drop: [],
})

await fs.writeFile("./dist/client.d.ts", "/// <reference types=\"vite/client\" />")

console.info(`Built in ${(performance.now() - t).toFixed(0)}ms`)