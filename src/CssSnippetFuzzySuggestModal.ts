import { FuzzySuggestModal } from "obsidian";
import { CSSEditorView } from "./CssEditorView";

export class CssSnippetFuzzySuggestModal extends FuzzySuggestModal<string> {
	getItems(): string[] {
		if (app.customCss?.snippets) {
			return app.customCss.snippets;
		}
		return [];
	}

	getItemText(item: string): string {
		return item;
	}

	onChooseItem(item: string, evt: MouseEvent | KeyboardEvent): void {
		const leaf = app.workspace.getLeaf();
		leaf.open(new CSSEditorView(leaf, item));
	}
}
