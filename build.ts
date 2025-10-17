import * as esbuild from "esbuild"
import * as fs from "fs/promises"
import consola from "consola";
import {spawn} from "child_process";

const replaceTsExt = (path: string) =>
	path.endsWith(".ts") ? path.slice(0, -3) + ".js" : path;

async function build () {
	consola.start(`Building source...`)
	await fs.rm("dist", { recursive: true, force: true })
	let t = performance.now()
	await esbuild.build({
		entryPoints: ["src/**/*.ts"],
		bundle: true,
		outdir: "dist",
		format: "esm",
		platform: "node",
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

	consola.success(`Built source in ${(performance.now() - t).toFixed(0)}ms`)

	consola.start(`Building types...`)

	await new Promise((resolve) => {
		const process = spawn('pnpm', ['run', 'build:types'], {stdio: 'inherit'})
		process.on('exit', code => {
			if (code === 0) {
				consola.success(`Built types successfully`)
				resolve(void 0)
			} else {
				consola.error(`Errors occurred during type building`)
				resolve(void 1)
			}
		})

		process.on('error', (err) => {
			consola.error(err.message)
		})
	})

	await Promise.all([
		fs.copyFile("./src/server.d.ts", "./dist/server.d.ts"),
		fs.rm("./dist/server.d.js"),
		fs.copyFile("./src/client.d.ts", "./dist/client.d.ts"),
		fs.rm("./dist/client.d.js"),
		fs.copyFile("./src/entries.d.ts", "./dist/entries.d.ts"),
		fs.rm("./dist/entries.d.js"),
	])
}


await build()
	.catch(consola.error)

