import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { existsSync } from "node:fs";
import type { Environment } from "vite";
import fs from "fs/promises";

export const resolveThisDir = (path: string): string =>
	dirname(fileURLToPath(path));

export function resolveUnknownExtension(
	path: string | undefined | null,
	ext: string[] = [".ts", ".js", ".tsx", ".jsx"],
): string | null {
	if (!path) return null;
	if (ext.some((e) => path.endsWith(e))) return path;
	for (const e of ext) {
		if (existsSync(path + e)) return path + e;
	}
	return null;
}

export async function fileExists(filePath: string): Promise<boolean> {
	try {
		await fs.access(filePath);
		return true;
	} catch {
		return false;
	}
}

export async function cloneResponse(response: Response, args: {
	body: string,
	headers: Record<string, string>,
}) {
	const headers = new Headers(response.headers)
	for (const [key, value] of Object.entries(args.headers)) {
		headers.set(key, value)
	}
	return new Response(args.body, {
		status: response.status,
		statusText: response.statusText,
		headers: headers,
	})
}