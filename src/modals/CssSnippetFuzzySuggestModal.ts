import { App, FuzzyMatch, FuzzySuggestModal, Platform } from "obsidian";
import CssEditorPlugin from "src/main";
import {
	deleteSnippetFile,
	getSnippetDirectory,
	toggleSnippetFileState,
} from "src/obsidian/file-system-helpers";
import { detachCssFileLeaves, openView } from "src/obsidian/workspace-helpers";
import { VIEW_TYPE_CSS } from "src/views/CssEditorView";
import { ErrorNotice, InfoNotice } from "src/obsidian/Notice";
import { CssFile } from "src/CssFile";

export class CssSnippetFuzzySuggestModal extends FuzzySuggestModal<CssFile> {
	plugin: CssEditorPlugin;

	constructor(app: App, plugin: CssEditorPlugin) {
		super(app);
		this.plugin = plugin;
		this.scope.register(["Mod"], "Enter", (evt: KeyboardEvent) => {
			if (!evt.isComposing && this.chooser?.useSelectedItem?.(evt)) {
				return false;
			}
		});
		this.scope.register(["Shift"], "Enter", (evt: KeyboardEvent) => {
			this.selectSuggestion(
				{
					item: new CssFile(this.inputEl.value),
					match: { score: 0, matches: [] },
				},
				evt
			);
			return false;
		});
		this.scope.register(["Mod"], "Delete", (evt: KeyboardEvent) => {
			if (!evt.isComposing && this.chooser?.useSelectedItem?.(evt)) {
				return false;
			}
		});
		this.scope.register([], "Tab", (evt: KeyboardEvent) => {
			if (this.chooser) {
				const selItem = this.chooser.selectedItem;
				const selSnippet = this.chooser.values[selItem].item;
				const isEnabled = toggleSnippetFileState(this.app, selSnippet);
				const selEl =
					this.chooser.suggestions[selItem].querySelector(
						".css-editor-status"
					);
				selEl?.setText(isEnabled ? "enabled" : "disabled");
				selEl?.removeClass(isEnabled ? "disabled" : "enabled");
				selEl?.addClass(isEnabled ? "enabled" : "disabled");
			}
			return false;
		});

		this.containerEl.addClass("css-editor-quick-switcher-modal");
		this.setPlaceholder("Find or create a CSS snippet...");
		this.setInstructions([
			{ command: "↑↓", purpose: "to navigate" },
			{
				command: Platform.isMacOS ? "⌘ ↵" : "ctrl ↵",
				purpose: "to open in new tab",
			},
			{ command: "shift ↵", purpose: "to create" },
			{
				command: Platform.isMacOS ? "⌘ del" : "ctrl del",
				purpose: "to delete",
			},
			{ command: "tab", purpose: "to enable/disable" },
			{ command: "esc", purpose: "to dismiss" },
		]);
	}

	isEnabled(item: CssFile): boolean {
		const currentState = this.app.customCss?.enabledSnippets?.has(
			item.basename
		);
		return currentState || false;
	}

	getItems(): CssFile[] {
		if (this.app.customCss?.snippets) {
			return this.app.customCss.snippets.map((x) => new CssFile(x));
		}
		return [];
	}

	getItemText(item: CssFile): string {
		return item.name;
	}

	renderSuggestion(item: FuzzyMatch<CssFile>, el: HTMLElement): void {
		super.renderSuggestion(item, el);
		el.addClass("mod-complex");
		if (el.hasChildNodes()) {
			const existingChildren = Array.from(el.childNodes);
			el.childNodes.forEach((child) => {
				el.removeChild(child);
			});
			el.appendChild(
				createDiv(
					{ cls: "suggestion-content" },
					(suggestionContentEl) => {
						suggestionContentEl.appendChild(
							createDiv({}, (nestedEl) => {
								existingChildren.forEach((child) => {
									nestedEl.appendChild(child);
								});
							})
						);
						suggestionContentEl.appendChild(
							createDiv(
								{ cls: "css-editor-suggestion-description" },
								(el) =>
									el.appendText(
										`${getSnippetDirectory(this.app)}${
											item.item.name
										}`
									)
							)
						);
					}
				)
			);
			const isEnabled = this.isEnabled(item.item);
			const isNewElement =
				this.inputEl.value.trim().length > 0 && item.match.score === 0;
			if (!isNewElement) {
				el.appendChild(
					createDiv(
						{
							cls: [
								"suggestion-aux",
								"css-editor-status",
								isEnabled ? "enabled" : "disabled",
							],
						},
						(el) =>
							el.appendText(isEnabled ? "enabled" : "disabled")
					)
				);
			}
		}
		if (this.inputEl.value.trim().length > 0 && item.match.score === 0) {
			el.appendChild(
				createDiv({ cls: "suggestion-aux" }, (el) => {
					el.appendChild(
						createSpan({ cls: "suggestion-hotkey" }, (el) => {
							el.appendText("Enter to create");
						})
					);
				})
			);
		}
	}

	async selectSuggestion(
		value: FuzzyMatch<CssFile>,
		evt: KeyboardEvent | MouseEvent
	): Promise<void> {
		try {
			await this.onChooseSuggestion(value, evt);
			this.close();
		} catch (err) {
			if (err instanceof Error) {
				new ErrorNotice(err.message);
			} else {
				new ErrorNotice("Failed to complete action. Reason unknown.");
			}
		}
	}

	async onChooseSuggestion(
		item: FuzzyMatch<CssFile>,
		evt: MouseEvent | KeyboardEvent
	): Promise<void> {
		const isCreateNewDueToNoSuggestion =
			this.inputEl.value.trim().length > 0 && item.match.score === 0;
		if (isCreateNewDueToNoSuggestion && item.item) {
			const openInNewTab = evt.metaKey;
			await this.plugin.createAndOpenSnippet(
				item.item.name,
				openInNewTab
			);
		} else {
			await this.onChooseItem(item.item, evt);
		}
	}

	onNoSuggestion(): void {
		const item = this.inputEl.value.trim();
		if (item.length > 0) {
			this.chooser?.setSuggestions?.([
				{ item: new CssFile(item), match: { score: 0, matches: [] } },
			]);
			this.chooser?.addMessage?.(
				"No CSS snippets found. Enter to create a new one."
			);
		} else {
			this.chooser?.setSuggestions?.([]);
			this.chooser?.addMessage?.(
				"No CSS snippets found. Type to search..."
			);
		}
	}

	async onChooseItem(
		item: CssFile,
		evt: MouseEvent | KeyboardEvent
	): Promise<void> {
		if (!item) return;
		if (evt instanceof KeyboardEvent) {
			if (evt.key === "Enter") {
				const openInNewTab = evt.metaKey;
				if (evt.shiftKey) {
					await this.plugin.createAndOpenSnippet(
						item.name,
						openInNewTab
					);
				} else {
					openView(this.app.workspace, VIEW_TYPE_CSS, openInNewTab, {
						file: item,
					});
				}
			} else if (evt.key === "Delete") {
				deleteSnippetFile(this.app, item);
				detachCssFileLeaves(this.app.workspace, item);
				new InfoNotice(`${item} was deleted.`);
			}
		} else {
			const openInNewTab = evt.metaKey;
			openView(this.app.workspace, VIEW_TYPE_CSS, openInNewTab, {
				file: item,
			});
		}
	}
}
