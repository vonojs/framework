import {clientEntry} from "@vonojs/framework/server";

export default function render(req: Request) {
	return new Response(`<h1>Hello World!</h1><script type="module" src="${clientEntry}"></script>`, {
		headers: {
			"content-type": "text/html"
		}
	})
}