export default (entryPath: string) => `
import serverMain from "${entryPath}";
export default {
	fetch: serverMain
};
`