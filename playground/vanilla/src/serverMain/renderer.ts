import { clientEntry, css, defineRenderHandler } from "@vonojs/framework/server";

export default defineRenderHandler(async (ctx) => {
	return {
		body: template,
		headers: {
			"content-type": "text/html",
		}
	}
})

const template = `
<!DOCTYPE html>
<head>
	${css.map(c => `<link rel="stylesheet" href="${c}">`).join("\n")}
	<script type="module" src="${clientEntry}"></script>
</head>
<body>
	<h1>Hello World!</h1>
</body>
</html>
`