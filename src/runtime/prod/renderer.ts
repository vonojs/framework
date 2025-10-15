import {defineRenderHandler} from "nitro/runtime";
// @ts-expect-error
import renderer from "@vonojs/framework/rendererEntry";

const handler = defineRenderHandler(async (context) => {
	let response: Response = await renderer(context.req);
	let headers = {}
	response.headers.forEach((value, key) => {
		headers[key] = value;
	})
	return {
		body: await response.text(),
		headers,
	}
});

export default handler;