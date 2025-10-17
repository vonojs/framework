import { clientEntry, defineHandler } from "@vonojs/framework/server";

export default defineHandler(async (ctx) => {
	console.log("client entry:", clientEntry)
})