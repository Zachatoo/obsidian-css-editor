import {
	App,
	ButtonComponent,
	FuzzyMatch,
	FuzzySuggestModal,
	Notice,
	Platform,
} from "obsidian";
import CssEditorPlugin from "src/main";
import {
	getSnippetDirectory,
	toggleSnippetFileState,
} from "src/obsidian/file-system-helpers";
import { openView } from "src/obsidian/workspace-helpers";
import { VIEW_TYPE_CSS } from "src/views/CssEditorView";
import { CssFile } from "src/CssFile";
import { handleError } from "src/utils/handle-error";
import { tryDeleteSnippet } from "src/utils/delete-snippet";

export class CssSnippetFuzzySuggestModal extends FuzzySuggestModal<CssFile> {
	plugin: CssEditorPlugin;

	constructor(app: App, plugin: CssEditorPlugin) {
		super(app);
		this.plugin = plugin;
		this.scope.register(["Mod"], "Enter", (evt: KeyboardEvent) => {
			if (!evt.isComposing && this.chooser?.useSelectedItem?.(evt)) {
				return false;
			}
			return true;
		});
		this.scope.register(["Shift"], "Enter", (evt: KeyboardEvent) => {
			this.selectSuggestion(
				{
					item: new CssFile(this.inputEl.value),
					match: { score: 0, matches: [] },
				},
				evt,
			);
			return false;
		});
		this.scope.register(["Mod"], "Delete", (evt: KeyboardEvent) => {
			if (!evt.isComposing && this.chooser?.useSelectedItem?.(evt)) {
				return false;
			}
			return true;
		});
		this.scope.register([], "Tab", (evt: KeyboardEvent) => {
			if (this.chooser) {
				const selectedItem = this.chooser.selectedItem;
				const file = this.chooser.values[selectedItem]?.item;
				if (!file) return false;
				const isEnabled = toggleSnippetFileState(this.app, file);
				const buttonEl =
					this.chooser.suggestions[selectedItem]?.querySelector(
						".css-editor-status",
					);
				buttonEl?.setText(isEnabled ? "enabled" : "disabled");
				buttonEl?.toggleClass("mod-cta", isEnabled);
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
			item.basename,
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
							createDiv(
								{ cls: "css-editor-suggestion-name" },
								(nestedEl) => {
									existingChildren.forEach((child) => {
										nestedEl.appendChild(child);
									});
								},
							),
						);
						suggestionContentEl.appendChild(
							createDiv(
								{ cls: "css-editor-suggestion-description" },
								(el) =>
									el.appendText(
										`${getSnippetDirectory(this.app)}${
											item.item.name
										}`,
									),
							),
						);
					},
				),
			);
			const isEnabled = this.isEnabled(item.item);
			const isNewElement =
				this.inputEl.value.trim().length > 0 && item.match.score === 0;
			if (!isNewElement) {
				const button = new ButtonComponent(el)
					.setButtonText(isEnabled ? "enabled" : "disabled")
					.setClass("css-editor-status")
					.onClick((e) => {
						e.stopPropagation();
						const newState = toggleSnippetFileState(
							this.app,
							item.item,
						);
						button.setButtonText(newState ? "enabled" : "disabled");
						if (newState) {
							button.setCta();
						} else {
							button.removeCta();
						}
					});
				if (isEnabled) {
					button.setCta();
				}
			}
		}
		if (this.inputEl.value.trim().length > 0 && item.match.score === 0) {
			el.appendChild(
				createDiv({ cls: "suggestion-aux" }, (el) => {
					el.appendChild(
						createSpan({ cls: "suggestion-hotkey" }, (el) => {
							el.appendText("Enter to create");
						}),
					);
				}),
			);
		}
	}

	selectSuggestion(
		value: FuzzyMatch<CssFile>,
		evt: KeyboardEvent | MouseEvent,
	): void {
		try {
			this.onChooseSuggestion(value, evt);
			this.close();
		} catch (err) {
			handleError(err, "Failed to open CSS file.");
		}
	}

	onChooseSuggestion(
		item: FuzzyMatch<CssFile>,
		evt: MouseEvent | KeyboardEvent,
	): void {
		const isCreateNewDueToNoSuggestion =
			this.inputEl.value.trim().length > 0 && item.match.score === 0;
		if (isCreateNewDueToNoSuggestion && item.item) {
			const openInNewTab = evt.metaKey;
			this.plugin
				.createAndOpenSnippet(item.item.name, openInNewTab)
				.catch((err) => {
					handleError(err, "Failed to create and open CSS file.");
				});
		} else {
			this.onChooseItem(item.item, evt);
		}
	}

	onNoSuggestion(): void {
		const item = this.inputEl.value.trim();
		if (item.length > 0) {
			this.chooser?.setSuggestions?.([
				{ item: new CssFile(item), match: { score: 0, matches: [] } },
			]);
			this.chooser?.addMessage?.(
				"No CSS snippets found. Enter to create a new one.",
			);
		} else {
			this.chooser?.setSuggestions?.([]);
			this.chooser?.addMessage?.(
				"No CSS snippets found. Type to search...",
			);
		}
	}

	onChooseItem(item: CssFile, evt: MouseEvent | KeyboardEvent): void {
		if (!item) return;
		if (evt instanceof KeyboardEvent) {
			if (evt.key === "Enter") {
				const openInNewTab = evt.metaKey;
				if (evt.shiftKey) {
					this.plugin
						.createAndOpenSnippet(item.name, openInNewTab)
						.catch((err) => {
							handleError(
								err,
								"Failed to create and open CSS file.",
							);
						});
				} else {
					openView(this.app.workspace, VIEW_TYPE_CSS, openInNewTab, {
						file: item,
					}).catch(handleError);
				}
			} else if (evt.key === "Delete") {
				tryDeleteSnippet(this.plugin, item)
					.then(() => {
						new Notice(`${item.name} was deleted.`);
					})
					.catch((err) => {
						handleError(err, "Failed to delete CSS file.");
					});
			}
		} else {
			const openInNewTab = evt.metaKey;
			openView(this.app.workspace, VIEW_TYPE_CSS, openInNewTab, {
				file: item,
			}).catch(handleError);
		}
	}
}
