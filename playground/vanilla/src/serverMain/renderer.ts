export default function render(req: Request) {
	return new Response("<h1>Hello World!</h1>", {
		headers: {
			"content-type": "text/html"
		}
	})
}