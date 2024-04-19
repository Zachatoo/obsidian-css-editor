import { App } from "obsidian";

export function getSnippetDirectory(app: App) {
	return `${app.vault.configDir}/snippets/`;
}

export async function readSnippetFile(
	app: App,
	fileName: string
): Promise<string> {
	const data = await app.vault.adapter.read(
		`${getSnippetDirectory(app)}${fileName}`
	);
	return data;
}

export async function createSnippetFile(
	app: App,
	fileName: string,
	data = ""
): Promise<void> {
	await _validateFilename(fileName);
	await _createSnippetDirectoryIfNotExists(app);
	await app.vault.adapter.write(
		`${getSnippetDirectory(app)}${fileName}`,
		data
	);
}

export async function writeSnippetFile(
	app: App,
	fileName: string,
	data: string
): Promise<void> {
	await app.vault.adapter.write(
		`${getSnippetDirectory(app)}${fileName}`,
		data
	);
}

export async function checkSnippetExists(
	app: App,
	fileName: string
): Promise<boolean> {
	return app.vault.adapter.exists(`${getSnippetDirectory(app)}${fileName}`);
}

export async function deleteSnippetFile(app: App, fileName: string) {
	await app.vault.adapter.remove(`${getSnippetDirectory(app)}${fileName}`);
}

export function toggleSnippetFileState(app: App, fileName: string) {
	const snippetName = fileName.replace(".css", "");
	if (!app.customCss?.enabledSnippets || !app.customCss.setCssEnabledStatus) {
		throw new Error("Failed to enable/disable CSS snippet.");
	}
	const isEnabled = app.customCss.enabledSnippets.has(snippetName);
	app.customCss.setCssEnabledStatus(snippetName, !isEnabled);
	return !isEnabled;
}

async function _createSnippetDirectoryIfNotExists(app: App) {
	if (!(await app.vault.adapter.exists(getSnippetDirectory(app)))) {
		await app.vault.adapter.mkdir(getSnippetDirectory(app));
	}
}

async function _validateFilename(value: string) {
	const errors = {
		exists: "",
		regex: "",
	};
	if (value.length > 0 && (await checkSnippetExists(this.app, value))) {
		errors.exists = "File already exists.";
	}
	const regex = /^[0-9a-zA-Z\-_ ]+\.css$/;
	if (!regex.test(value)) {
		errors.regex =
			"Must end with .css and only contain alphanumeric, spaces, dashes, or underscore characters.";
	}
	if (Object.values(errors).some((x) => x !== "")) {
		const message = Object.values(errors)
			.filter((x) => x !== "")
			.reduce((acc, curr) => `${acc}\n${curr}`, "Failed to create file.");
		throw new Error(message);
	}
}
