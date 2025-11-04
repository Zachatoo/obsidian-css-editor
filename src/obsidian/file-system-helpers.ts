import { App, normalizePath } from "obsidian";
import { CssFile } from "src/CssFile";

export function getSnippetDirectory(app: App) {
	return `${app.vault.configDir}/snippets/`;
}

export async function readSnippetFile(
	app: App,
	file: CssFile,
): Promise<string> {
	const data = await app.vault.adapter.read(
		normalizePath(`${getSnippetDirectory(app)}${file.name}`),
	);
	return data;
}

export async function createSnippetFile(
	app: App,
	fileName: string,
	data = "",
): Promise<CssFile> {
	const file = new CssFile(fileName);
	await _validateFile(app, file);
	await _createSnippetDirectoryIfNotExists(app);
	await app.vault.adapter.write(
		normalizePath(`${getSnippetDirectory(app)}${file.name}`),
		data,
	);
	return file;
}

export async function renameSnippetFile(
	app: App,
	oldFile: CssFile,
	newFileName: string,
): Promise<CssFile> {
	const newFile = new CssFile(newFileName);
	if (oldFile.name === newFile.name) return oldFile;
	await _validateFile(app, newFile);
	await app.vault.adapter.rename(
		normalizePath(`${getSnippetDirectory(app)}${oldFile.name}`),
		normalizePath(`${getSnippetDirectory(app)}${newFile.name}`),
	);
	toggleSnippetFileState(app, oldFile);
	toggleSnippetFileState(app, newFile);
	app.workspace.trigger("css-snippet-rename", newFile, oldFile.name);
	return newFile;
}

export async function writeSnippetFile(
	app: App,
	file: CssFile,
	data: string,
): Promise<void> {
	await app.vault.adapter.write(
		normalizePath(`${getSnippetDirectory(app)}${file.name}`),
		data,
	);
}

export async function checkSnippetExists(
	app: App,
	fileName: string,
): Promise<boolean> {
	return app.vault.adapter.exists(
		normalizePath(`${getSnippetDirectory(app)}${fileName}`),
	);
}

export async function deleteSnippetFile(app: App, file: CssFile) {
	await app.vault.adapter.remove(
		normalizePath(`${getSnippetDirectory(app)}${file.name}`),
	);
}

export function toggleSnippetFileState(app: App, file: CssFile) {
	if (!app.customCss?.enabledSnippets || !app.customCss.setCssEnabledStatus) {
		throw new Error("Failed to enable/disable CSS snippet.");
	}
	const isEnabled = app.customCss.enabledSnippets.has(file.basename);
	app.customCss.setCssEnabledStatus(file.basename, !isEnabled);
	return !isEnabled;
}

async function _createSnippetDirectoryIfNotExists(app: App) {
	if (!(await app.vault.adapter.exists(getSnippetDirectory(app)))) {
		await app.vault.adapter.mkdir(getSnippetDirectory(app));
	}
}

async function _validateFile(app: App, file: CssFile) {
	const errors = {
		exists: "",
		regex: "",
	};
	if (file.name.length > 0 && (await checkSnippetExists(app, file.name))) {
		errors.exists = "File already exists.";
	}
	const regex = /^[0-9a-zA-Z\-_ ]+\.css$/;
	if (!regex.test(file.name)) {
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
