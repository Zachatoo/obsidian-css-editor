import { requireApiVersion, ViewState, Workspace } from "obsidian";
import { CssFile } from "src/CssFile";
import { VIEW_TYPE_CSS } from "src/views/CssEditorView";

export async function openView(
	workspace: Workspace,
	type: ViewState["type"],
	openInNewTab: boolean,
	state: { file: CssFile },
) {
	const leaf = workspace.getLeaf(openInNewTab);
	await leaf.setViewState({
		type,
		state,
	});
	workspace.setActiveLeaf(leaf);
}

export async function detachCssFileLeaves(workspace: Workspace, file: CssFile) {
	const leaves = workspace.getLeavesOfType(VIEW_TYPE_CSS);
	for (const leaf of leaves) {
		if (requireApiVersion("1.7.2")) {
			await leaf.loadIfDeferred();
		}
		if (leaf.getViewState().state?.file === file.name) {
			leaf.detach();
		}
	}
}
