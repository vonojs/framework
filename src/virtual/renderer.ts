export default (rendererPath: string) => `
import {defineRenderHandler} from "nitro/runtime";
import renderer from "${rendererPath}";
export default defineRenderHandler(async (context) => {
	let response = await renderer(context.req);
	if(response instanceof Promise) {
		response = await response;
	}
	return {
		body: await response.text(),
		headers: response.headers,
		//status: response.status,
		//statusText: response.statusText,
	}
});
`