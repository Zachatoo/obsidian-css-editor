import { App } from "obsidian";

export async function readSnippetFile(
	app: App,
	fileName: string
): Promise<string> {
	const data = await app.vault.adapter.read(
		`${app.vault.configDir}/snippets/${fileName}.css`
	);
	return data;
}

export async function writeSnippetFile(
	app: App,
	fileName: string,
	data: string
): Promise<void> {
	await app.vault.adapter.write(
		`${app.vault.configDir}/snippets/${fileName}.css`,
		data
	);
}
