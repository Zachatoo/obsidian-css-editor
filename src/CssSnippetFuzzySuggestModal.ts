import { FuzzyMatch, FuzzySuggestModal } from "obsidian";
import { CssEditorView } from "./CssEditorView";
import { getSnippetDirectory } from "./file-system-helpers";

export class CssSnippetFuzzySuggestModal extends FuzzySuggestModal<string> {
	getItems(): string[] {
		if (this.app.customCss?.snippets) {
			return this.app.customCss.snippets.map((x) => `${x}.css`);
		}
		return [];
	}

	getItemText(item: string): string {
		return item;
	}

	renderSuggestion(item: FuzzyMatch<string>, el: HTMLElement): void {
		super.renderSuggestion(item, el);
		el.appendChild(
			createDiv({ cls: "css-editor-suggestion-description" }, (el) =>
				el.appendText(`${getSnippetDirectory(this.app)}${item.item}`)
			)
		);
	}

	onChooseItem(item: string, evt: MouseEvent | KeyboardEvent): void {
		const leaf = this.app.workspace.getLeaf();
		leaf.open(new CssEditorView(leaf, item));
	}
}
