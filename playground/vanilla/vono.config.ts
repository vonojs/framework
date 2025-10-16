import {Vono} from "../../src/mod";

export default new Vono(({ buildFor, BuildTarget }) => {
	buildFor(BuildTarget.Cloudflare)
})