import { EditorView } from "@codemirror/view";
import { SearchCursor } from "@codemirror/search";
import { ButtonComponent, Scope } from "obsidian";
import { highlightEffect } from "src/codemirror-extensions/highlight-search-match";
import { highlightDecoration } from "src/codemirror-extensions/highlight-search-match";

export class Search {
	private containerEl: HTMLDivElement;
	private searchInputEl: HTMLInputElement;
	private countEl: HTMLDivElement;
	scope: Scope;
	private cursor: SearchCursor | null = null;
	private lastQuery = "";
	private match: { from: number; to: number } | null = null;
	private matches: { from: number; to: number }[] = [];

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
		const documentSearchEl = this.containerEl.createDiv("document-search");

		const searchInputContainerEl = documentSearchEl.createDiv(
			"search-input-container document-search-input",
		);
		this.searchInputEl = searchInputContainerEl.createEl("input", {
			type: "text",
			placeholder: "Find...",
		});
		this.countEl = searchInputContainerEl.createDiv(
			"document-search-count",
		);
		this.searchInputEl.addEventListener("input", () => {
			this.updateQuery();
		});
		this.searchInputEl.addEventListener("keydown", (e) => {
			if (e.isComposing) return;
			if (e.key === "Enter") {
				e.preventDefault();
				if (e.shiftKey) {
					this.findPrevious();
				} else {
					this.findNext();
				}
			}
		});

		const searchButtonContainerEl = documentSearchEl.createDiv({
			cls: "document-search-buttons",
			type: "text",
		});
		new ButtonComponent(searchButtonContainerEl)
			.setClass("document-search-button")
			.setClass("clickable-icon")
			.setIcon("lucide-arrow-up")
			// eslint-disable-next-line obsidianmd/ui/sentence-case
			.setTooltip("Previous\n⇧ F3", { placement: "top" })
			.onClick(() => this.findPrevious());
		new ButtonComponent(searchButtonContainerEl)
			.setClass("document-search-button")
			.setClass("clickable-icon")
			.setIcon("lucide-arrow-down")
			// eslint-disable-next-line obsidianmd/ui/sentence-case
			.setTooltip("Next\nF3", { placement: "top" })
			.onClick(() => this.findNext());
		new ButtonComponent(searchButtonContainerEl)
			.setClass("document-search-button")
			.setClass("clickable-icon")
			.setIcon("lucide-text-select")
			// eslint-disable-next-line obsidianmd/ui/sentence-case
			.setTooltip("Find all\n⌥ Enter", { placement: "top" })
			.onClick(() => this.findAll());

		new ButtonComponent(documentSearchEl)
			.setClass("document-search-close-button")
			.setClass("clickable-icon")
			.setIcon("lucide-x")
			.setTooltip("Exit search", { placement: "top" })
			.onClick(() => this.close());

		this.scope = new Scope(parentScope);
		this.scope.register([], "F3", (e) => {
			// Prevent showing Codemirror's native search
			e.preventDefault();
			this.findNext();
		});
		this.scope.register(["Shift"], "F3", (e) => {
			// Prevent showing Codemirror's native search
			e.preventDefault();
			this.findPrevious();
		});
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

	private findNext() {
		if (this.cursor) {
			this.cursor.next();
		}
		this.updateQuery();
	}

	private findPrevious() {
		if (!this.cursor) return;
		this.collectMatches();
		const query = this.getQuery();
		const matchIndex = this.matches.findIndex(
			(m) => m.from === this.match?.from && m.to === this.match?.to,
		);
		if (matchIndex !== -1) {
			const previousIndex =
				(matchIndex - 1 + this.matches.length) % this.matches.length;
			const previousMatch = this.matches.at(previousIndex)!;
			this.cursor = createSearchCursor(this.editor, query);
			while (!this.cursor.done) {
				if (
					this.cursor.value.from === previousMatch.from &&
					this.cursor.value.to === previousMatch.to
				) {
					break;
				}
				this.cursor.next();
			}
		}
		this.updateQuery();
	}

	private findAll() {
		this.collectMatches();
		this.editor.dispatch({
			effects: highlightEffect.of(
				this.matches.map((m) =>
					highlightDecoration.range(m.from, m.to),
				),
			),
		});
		this.updateCount();
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
		if (this.cursor.done) {
			this.clearHighlights();
		} else {
			this.match = {
				from: this.cursor.value.from,
				to: this.cursor.value.to,
			};
			this.editor.dispatch({
				effects: highlightEffect.of([
					highlightDecoration.range(this.match.from, this.match.to),
				]),
				scrollIntoView: true,
			});
		}
		this.collectMatches();
		this.updateCount();
	}

	private updateCount() {
		const query = this.getQuery();
		if (!query) {
			this.countEl.setText("");
			return;
		}
		const matchIndex = this.matches.findIndex(
			(m) => m.from === this.match?.from && m.to === this.match?.to,
		);
		const count = this.matches.length;
		this.countEl.setText(`${matchIndex + 1} / ${count}`);
	}

	private collectMatches() {
		const query = this.getQuery();
		if (!query) {
			this.matches = [];
			return;
		}
		const cursor = createSearchCursor(this.editor, query);
		cursor.next();
		const matches: { from: number; to: number }[] = [];
		while (!cursor.done) {
			matches.push({
				from: cursor.value.from,
				to: cursor.value.to,
			});
			cursor.next();
		}
		this.matches = matches;
	}

	clearHighlights() {
		this.editor.dispatch({
			effects: highlightEffect.of([]),
		});
	}

	close() {
		this.containerEl.remove();
		this.cursor = null;
		this.matches = [];
		this.match = null;
		this.clearHighlights();
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
