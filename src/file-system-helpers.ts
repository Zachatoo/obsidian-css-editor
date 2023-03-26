import { App } from "obsidian";
import * as fs from "fs/promises";

export async function readSnippetFile(
	app: App,
	fileName: string
): Promise<string> {
	const data = await fs.readFile(
		`${app.vault.adapter.basePath}/.obsidian/snippets/${fileName}.css`,
		"utf-8"
	);
	return data;
}

export async function writeSnippetFile(
	app: App,
	fileName: string,
	data: string
): Promise<void> {
	await fs.writeFile(
		`${app.vault.adapter.basePath}/.obsidian/snippets/${fileName}.css`,
		data
	);
}
