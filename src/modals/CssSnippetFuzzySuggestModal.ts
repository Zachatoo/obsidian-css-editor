import { App, FuzzyMatch, FuzzySuggestModal, Platform } from "obsidian";
import {
	createSnippetFile,
	deleteSnippetFile,
	getSnippetDirectory,
} from "src/obsidian/file-system-helpers";
import {
	detachLeavesOfTypeAndDisplay,
	openView,
} from "src/obsidian/workspace-helpers";
import { VIEW_TYPE_CSS } from "src/views/CssEditorView";
import { ErrorNotice, InfoNotice } from "src/obsidian/Notice";

export class CssSnippetFuzzySuggestModal extends FuzzySuggestModal<
	string | null
> {
	constructor(app: App) {
		super(app);
		this.scope.register(["Meta"], "Enter", (evt: KeyboardEvent) => {
			if (!evt.isComposing && this.chooser?.useSelectedItem?.(evt)) {
				return false;
			}
		});
		this.scope.register(["Shift"], "Enter", (evt: KeyboardEvent) => {
			this.selectSuggestion(
				{ item: this.inputEl.value, match: { score: 0, matches: [] } },
				evt
			);
			return false;
		});
		this.scope.register(["Meta"], "Delete", (evt: KeyboardEvent) => {
			if (!evt.isComposing && this.chooser?.useSelectedItem?.(evt)) {
				return false;
			}
		});
		this.containerEl.addClass("css-editor-quick-switcher-modal");
		this.setPlaceholder("Find or create a CSS snippet...");
		this.renderPromptInstructions();
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
											item.item
										}`
									)
							)
						);
					}
				)
			);
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
		value: FuzzyMatch<string | null>,
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
		item: FuzzyMatch<string | null>,
		evt: MouseEvent | KeyboardEvent
	): Promise<void> {
		const isCreateNewDueToNoSuggestion =
			this.inputEl.value.trim().length > 0 && item.match.score === 0;
		if (isCreateNewDueToNoSuggestion && item.item) {
			const openInNewTab = evt.metaKey;
			await this.createAndOpenSnippet(item.item, openInNewTab);
		} else {
			await this.onChooseItem(item.item, evt);
		}
	}

	onNoSuggestion(): void {
		super.onNoSuggestion();
		const item = this.inputEl.value.trim();
		this.chooser?.setSuggestions?.([
			{ item, match: { score: 0, matches: [] } },
		]);
		this.chooser?.addMessage?.(
			"No CSS snippets found. Enter to create a new one."
		);
	}

	async onChooseItem(
		item: string | null,
		evt: MouseEvent | KeyboardEvent
	): Promise<void> {
		if (!item) return;
		if (evt instanceof KeyboardEvent) {
			if (evt.key === "Enter") {
				const openInNewTab = evt.metaKey;
				if (evt.shiftKey) {
					await this.createAndOpenSnippet(item, openInNewTab);
				} else {
					openView(this.app.workspace, VIEW_TYPE_CSS, openInNewTab, {
						filename: item,
					});
				}
			} else if (evt.key === "Delete") {
				deleteSnippetFile(this.app, item);
				detachLeavesOfTypeAndDisplay(
					this.app.workspace,
					VIEW_TYPE_CSS,
					item
				);
				new InfoNotice(`${item} was deleted.`);
			}
		} else {
			const openInNewTab = evt.metaKey;
			openView(this.app.workspace, VIEW_TYPE_CSS, openInNewTab, {
				filename: item,
			});
		}
	}

	async createAndOpenSnippet(filename: string, openInNewTab: boolean) {
		await createSnippetFile(this.app, filename, "");
		this.app.customCss?.setCssEnabledStatus?.(
			filename.replace(".css", ""),
			true
		);
		new InfoNotice(`${filename} was created.`);
		openView(this.app.workspace, VIEW_TYPE_CSS, openInNewTab, {
			filename,
		});
	}

	renderPromptInstructions() {
		this.modalEl.appendChild(
			createDiv({ cls: "prompt-instructions" }, (el) => {
				el.appendChild(
					this.createPromptInstruction("↑↓", "to navigate")
				);
				el.appendChild(this.createPromptInstruction("↵", "to open"));
				el.appendChild(
					this.createPromptInstruction(
						Platform.isMacOS ? "⌘ ↵" : "ctrl ↵",
						"to open in new tab"
					)
				);
				el.appendChild(
					this.createPromptInstruction("shift ↵", "to create")
				);
				el.appendChild(
					this.createPromptInstruction(
						Platform.isMacOS ? "⌘ del" : "ctrl del",
						"to delete"
					)
				);
				el.appendChild(
					this.createPromptInstruction("esc", "to dismiss")
				);
			})
		);
	}

	createPromptInstruction(command: string, title: string) {
		return createDiv({ cls: "prompt-instruction" }, (el) => {
			el.appendChild(
				createDiv({ cls: "prompt-instruction-command" }, (el) =>
					el.appendText(command)
				)
			);
			el.appendChild(createSpan({}, (el) => el.appendText(title)));
		});
	}
}
