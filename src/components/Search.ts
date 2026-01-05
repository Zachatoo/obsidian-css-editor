import { EditorView } from "@codemirror/view";
import { SearchCursor } from "@codemirror/search";
import { Scope } from "obsidian";
import { highlightEffect } from "src/codemirror-extensions/highlight-search-match";
import { highlightDecoration } from "src/codemirror-extensions/highlight-search-match";

export class Search {
	private containerEl: HTMLDivElement;
	private searchInputEl: HTMLInputElement;
	private countEl: HTMLDivElement;
	scope: Scope;
	private cursor: SearchCursor | null = null;
	private lastQuery = "";

	constructor(
		parentScope: Scope,
		private editor: EditorView,
		parentEl: HTMLElement,
		private onClose: () => void,
	) {
		this.containerEl = parentEl.createDiv({
			cls: "document-search-container",
			prepend: true,
		});
		const searchInputContainerEl = this.containerEl.createDiv(
			"search-input-container document-search-input",
		);
		this.searchInputEl = searchInputContainerEl.createEl("input", {
			type: "text",
			placeholder: "Find...",
		});
		this.countEl = searchInputContainerEl.createDiv(
			"document-search-count",
		);
		this.searchInputEl.addEventListener("input", (e) => {
			this.updateQuery();
		});
		this.searchInputEl.addEventListener("keydown", (e) => {
			if (e.isComposing) return;
			if (e.key === "Enter") {
				e.preventDefault();
				this.updateQuery();
			}
		});
		this.scope = new Scope(parentScope);
		this.scope.register([], "Escape", this.close.bind(this));
		this.focus();
	}

	focus() {
		const selection = activeWindow?.getSelection()?.toString();
		if (selection) {
			this.searchInputEl.value = selection;
			this.updateQuery();
		}
		this.searchInputEl.focus();
		this.searchInputEl.select();
	}

	getQuery() {
		return this.searchInputEl.value;
	}

	updateQuery() {
		const query = this.getQuery();
		if (!this.cursor || this.cursor.done || this.lastQuery !== query) {
			this.cursor = createSearchCursor(this.editor, query);
			this.lastQuery = query;
			this.cursor.next();
		}
		if (this.cursor.done) {
			this.cursor = createSearchCursor(this.editor, query);
			this.cursor.next();
		}
		const matches = [];
		while (!this.cursor.done) {
			matches.push({
				from: this.cursor.value.from,
				to: this.cursor.value.to,
			});
			this.cursor.next();
		}
		this.editor.dispatch({
			effects: highlightEffect.of(
				matches.map((m) => highlightDecoration.range(m.from, m.to)),
			),
			scrollIntoView: true,
		});
		this.updateCount(matches.length);
	}

	private updateCount(count: number) {
		const query = this.getQuery();
		if (!query) {
			this.countEl.setText("");
			this.countEl.toggleClass("mod-no-match", false);
			return;
		}
		if (count === 0) {
			this.countEl.setText("No results");
			this.countEl.toggleClass("mod-no-match", true);
		} else {
			this.countEl.setText(`${count} result${count > 1 ? "s" : ""}`);
			this.countEl.toggleClass("mod-no-match", false);
		}
	}

	close() {
		this.containerEl.remove();
		this.cursor = null;
		this.editor.dispatch({
			effects: highlightEffect.of([]),
		});
		this.onClose();
	}
}

function createSearchCursor(editor: EditorView, query: string) {
	return new SearchCursor(
		editor.state.doc,
		query,
		undefined,
		undefined,
		(v) => v.toLowerCase(),
	);
}
