import { ViewState, Workspace } from "obsidian";

export async function openView(
	workspace: Workspace,
	type: ViewState["type"],
	state: unknown
) {
	const leaf = workspace.getLeaf();
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
