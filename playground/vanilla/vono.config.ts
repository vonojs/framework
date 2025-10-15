import {Vono} from "../../src/mod";

export default new Vono(({ buildFor, clientMain }) => {
	buildFor("cloudflare-module", {
		cloudflare: {
			deployConfig: true,
			nodeCompat: true,
			wrangler: {
				name: "client-boilerplate"
			}
		},
	})
})