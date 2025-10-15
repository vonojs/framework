import {clientEntry, css} from "@vonojs/framework/server";

export default function render(req: Request) {
	return new Response(`
<!DOCTYPE html>
<head>
	${css.map(c => `<link rel="stylesheet" href="${c}">`).join("\n")}
	<script type="module" src="${clientEntry}"></script>
</head>
<body>
	<h1>Hello World!</h1>
</body>
</html>
`, {
		headers: {
			"content-type": "text/html"
		}
	})
}