#!/usr/bin/env node

import { consola } from "consola";
import * as fs from "node:fs/promises";
import {fileExists} from "./utils.ts";
import path from "node:path";

consola.start("Creating vono.js project");
let name = await consola.prompt("Enter project name:");

if(!name || typeof name !== "string" || name.trim().length === 0) {
	consola.error("Project name is required");
	process.exit(1)
}

name = name.trim();

const exists = await fileExists(path.join(process.cwd(), name))

if(exists) {
	consola.error(`Directory ${name} already exists`);
	process.exit(1)
}

const targets = {
	"Node": "Node",
	"Node (Custom Handler)": "NodeHandler",
	"Deno": "Deno",
	"Bun": "Bun",
	"Cloudflare": "Cloudflare",
	"Netlify": "Netlify",
	"Deno Deploy": "DenoDeploy",
	"Azure": "Azure",
	"AWS Lambda": "AWSLambda",
	"Vercel": "Vercel",
}

const target = await consola.prompt("Choose a built target (this can be changed later) (experimental):", {
	type: "select",
	options: Object.keys(targets),
	initial: "Node"
}) as keyof typeof targets;

consola.log("")
consola.start("Creating project...");

await fs.mkdir(name, {recursive: true})
await fs.writeFile(
	path.join(process.cwd(), name, "vono.config.ts"),
	`import { Vono } from "@vonojs/framework";

// https://github.com/vonojs/framework
export default new Vono(({ buildFor, BuildTarget }) => {
	${target === "Node" ? "" : `buildFor(BuildTarget.${targets[target]})`}
})`
)

await fs.writeFile(path.join(process.cwd(), name, "package.json"), `{
  "name": "${name}",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "vono dev",
    "build": "vono build"
  },
  "dependencies": {
    "@vonojs/framework": "latest",
    "typescript": "^5.9.3"
  }
}
`)

await fs.writeFile(path.join(process.cwd(), name, ".gitignore"), `logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*
node_modules
dist
dist-ssr
*.local
.output
.wrangler
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
`)

await fs.writeFile(path.join(process.cwd(), name, "tsconfig.json"), `{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "types": ["@vonojs/framework/client"],
    "paths": {
      "~/clientMain/*": ["./src/clientMain/*"],
      "~/serverMain/*": ["./src/serverMain/*"],
    }
  },
}
`)

await fs.mkdir(path.join(process.cwd(), name, "src"), {recursive: true})
await fs.mkdir(path.join(process.cwd(), name, "src", "clientMain"), {recursive: true})
await fs.mkdir(path.join(process.cwd(), name, "src", "serverMain"), {recursive: true})
await fs.mkdir(path.join(process.cwd(), name, "src", "serverMain", "routes", "api"), {recursive: true})
await fs.mkdir(path.join(process.cwd(), name, "src", "clientMain", "assets"), {recursive: true})

await fs.writeFile(path.join(process.cwd(), name, "src", "clientMain", "main.ts"), `import "~/clientMain/assets/styles.css"

console.log("Hello from clientMain!")
`)

await fs.writeFile(path.join(process.cwd(), name, "src", "serverMain", "main.ts"), `import {
defineHandler } from "@vonojs/framework/server"

function loggingMiddleware(url: URL) {
  console.log(\`[\${Date.now()}] request: \${url.pathname}\`)
}

export default defineHandler((ctx) => {
	loggingMiddleware(ctx.url)
})
`)

await fs.writeFile(path.join(process.cwd(), name, "src", "serverMain", "renderer.ts"), `import { clientEntry, css, defineRenderHandler } from "@vonojs/framework/server";

export default defineRenderHandler((_ctx) => ({
	body: template,
	headers: {
		"content-type": "text/html",
	}
}))

const template = \`
<!DOCTYPE html>
<head>
	\${css.map(c => \`<link rel="stylesheet" href="\${c}">\`).join("\\n")}
	<script type="module" src="\${clientEntry}"></script>
</head>
<body>
	<h1>Hello World!</h1>
</body>
</html>
\`
`)

await fs.writeFile(path.join(process.cwd(), name, "src", "clientMain", "assets", "styles.css"), `body {
	font-family: sans-serif;
}
`)

await fs.writeFile(path.join(process.cwd(), name, "src", "serverMain", "routes", "api", "ping.ts"), `import { defineHandler } from "@vonojs/framework/server";

export default defineHandler(() => "ping")`)

consola.success("Project created successfully!")
consola.log("")
consola.info("To get started:")
consola.log(`  cd ${name}`)
consola.log(`  {your_package_manager} install`)
consola.log("  {your_package_manager} vono dev")