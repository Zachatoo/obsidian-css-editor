import { App } from "obsidian";

export function getSnippetDirectory(app: App) {
	return `${app.vault.configDir}/snippets/`;
}

export async function readSnippetFile(
	app: App,
	fileName: string
): Promise<string> {
	const data = await app.vault.adapter.read(
		`${getSnippetDirectory(app)}${fileName}.css`
	);
	return data;
}

export async function writeSnippetFile(
	app: App,
	fileName: string,
	data: string
): Promise<void> {
	await createSnippetDirectoryIfNotExists(app);
	await app.vault.adapter.write(
		`${getSnippetDirectory(app)}${fileName}.css`,
		data
	);
}

async function createSnippetDirectoryIfNotExists(app: App) {
	if (!(await app.vault.adapter.exists(getSnippetDirectory(app)))) {
		await app.vault.adapter.mkdir(getSnippetDirectory(app));
	}
}
