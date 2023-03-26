import { FuzzySuggestModal } from "obsidian";
import { CSSView } from "./CssEditorView";

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
		leaf.open(new CSSView(leaf, item));
	}
}
