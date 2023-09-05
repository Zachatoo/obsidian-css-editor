import { ViewState, Workspace } from "obsidian";

export async function openView(
	workspace: Workspace,
	type: ViewState["type"],
	evt: MouseEvent | KeyboardEvent,
	state: unknown
) {
	const openInNewTab = evt instanceof KeyboardEvent && evt.metaKey;
	const leaf = workspace.getLeaf(openInNewTab);
	await leaf.setViewState({
		type,
		state,
	});
	workspace.setActiveLeaf(leaf);
}

export function detachLeavesOfTypeAndDisplay(
	workspace: Workspace,
	type: ViewState["type"],
	display: string
) {
	const leaves = workspace.getLeavesOfType(type);
	leaves.forEach((leaf) => {
		if (leaf.getDisplayText() === display) {
			leaf.detach();
		}
	});
}
