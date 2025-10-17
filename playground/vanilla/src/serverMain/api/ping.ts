import { defineHandler } from "@vonojs/framework/server"

export default defineHandler(async (_ctx) => {
	return {
		message: "pong",
		timestamp: Date.now(),
	}
})