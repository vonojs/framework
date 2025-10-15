// @ts-expect-error
const RefreshRuntime = await import("react-refresh");
RefreshRuntime.injectIntoGlobalHook(globalThis);
// @ts-expect-error
globalThis.$RefreshReg$ = () => {};
// @ts-expect-error
globalThis.$RefreshSig$ = () => (type) => type;
// @ts-expect-error
globalThis.__vite_plugin_react_preamble_installed__ = true;

await import("@vite/client")
	.catch(console.error);
import("./csrStrategy.ts")
	.catch(console.error);


