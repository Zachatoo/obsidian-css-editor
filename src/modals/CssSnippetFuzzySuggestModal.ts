import { App, FuzzyMatch, FuzzySuggestModal } from "obsidian";
import { getSnippetDirectory } from "../file-system-helpers";

export class CssSnippetFuzzySuggestModal extends FuzzySuggestModal<string> {
	constructor(
		app: App,
		onChooseItem: (item: string, evt: MouseEvent | KeyboardEvent) => void
	) {
		super(app);
		this.onChooseItem = onChooseItem;
	}

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
		throw new Error("Method not implemented.");
	}
}
