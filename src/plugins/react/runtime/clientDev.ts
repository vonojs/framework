import "@vite/client";
import {createRoot} from "react-dom/client"
import {createElement} from "react";

// @ts-expect-error
const RefreshRuntime = await import("react-refresh");
RefreshRuntime.injectIntoGlobalHook(globalThis);
// @ts-expect-error
globalThis.$RefreshReg$ = () => {};
// @ts-expect-error
globalThis.$RefreshSig$ = () => (type) => type;
// @ts-expect-error
globalThis.__vite_plugin_react_preamble_installed__ = true;

// @ts-expect-error
const App = await import( "@vonojs/framework/clientEntry")
	.then(module => module.default)
	.catch(console.error)

createRoot(document.body).render(createElement(App));
