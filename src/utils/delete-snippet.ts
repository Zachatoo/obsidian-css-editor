import { App } from "obsidian";
import { CssFile } from "src/CssFile";
import CssEditorPlugin from "src/main";
import { CssSnippetDeleteConfirmModal } from "src/modals/CssSnippetDeleteConfirmModal";
import { deleteSnippetFile } from "src/utils/file-system-helpers";
import { detachCssFileLeaves } from "src/utils/workspace-helpers";

export async function tryDeleteSnippet(
	plugin: CssEditorPlugin,
	file: CssFile,
): Promise<void> {
	if (plugin.settings.promptDelete) {
		const modal = new CssSnippetDeleteConfirmModal(
			plugin.app,
			plugin,
			file,
		);
		modal.open();
	} else {
		await deleteSnippet(plugin.app, file);
	}
}

/** Prefer to call `tryDeleteSnippet` */
export async function deleteSnippet(app: App, file: CssFile): Promise<void> {
	await deleteSnippetFile(app, file);
	await detachCssFileLeaves(app.workspace, file);
}
