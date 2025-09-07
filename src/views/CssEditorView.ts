import {
	debounce,
	ItemView,
	Platform,
	Scope,
	ViewStateResult,
	WorkspaceLeaf,
} from "obsidian";
import { EditorView } from "@codemirror/view";
import { vim } from "@replit/codemirror-vim";
import { CssFile } from "src/CssFile";
import {
	deleteSnippetFile,
	readSnippetFile,
	renameSnippetFile,
	toggleSnippetFileState,
	writeSnippetFile,
} from "../obsidian/file-system-helpers";
import { basicExtensions } from "../codemirror-extensions/basic-extensions";
import { TransactionSpec } from "@codemirror/state";
import { history } from "@codemirror/commands";
import CssEditorPlugin from "src/main";
import {
	historyCompartment,
	indentSize,
	lineWrap,
} from "src/codemirror-extensions/compartments";
import { indentUnit } from "@codemirror/language";
import { CssSnippetRenameModal } from "src/modals/CssSnippetRenameModal";
import { focusAndSelectElement } from "src/obsidian/view-helpers";
import { colorPickerPlugin } from "src/codemirror-extensions/color-picker";
import { detachCssFileLeaves } from "src/obsidian/workspace-helpers";
import { CssSnippetDeleteConfirmModal } from "src/modals/CssSnippetDeleteConfirmModal";
import { ErrorNotice } from "src/obsidian/Notice";

export const VIEW_TYPE_CSS = "css-editor-view";

export class CssEditorView extends ItemView {
	private plugin: CssEditorPlugin;
	private editor: EditorView;
	private file: CssFile | null = null;
	private isSavingTitle = false;
	/** If the editor contents differ from the file contents on disk */
	private isEditorDirty = false;

	constructor(leaf: WorkspaceLeaf, plugin: CssEditorPlugin) {
		super(leaf);
		this.plugin = plugin;

		this.navigation = true;
		this.editor = new EditorView({
			parent: this.contentEl,
			extensions: [
				basicExtensions,
				lineWrap.of(
					this.plugin.settings.lineWrap ? EditorView.lineWrapping : []
				),
				indentSize.of(
					indentUnit.of("".padEnd(this.plugin.settings.indentSize))
				),
				historyCompartment.of(history()),
				colorPickerPlugin,
				this.app.vault.getConfig?.("vimMode") ? vim() : [],
				EditorView.updateListener.of((update) => {
					if (update.docChanged) {
						this.isEditorDirty = true;
						this.requestSave(update.state.doc.toString());
						if (this.file) {
							this.app.workspace.trigger(
								"css-editor-change",
								this.file,
								update.state.doc.toString()
							);
						}
					}
				}),
			],
		});
		this.scope = new Scope(this.app.scope);
		this.scope.register(null, "F2", () => {
			if (!this.file) return;
			if (this.titleEl.isShown()) {
				focusAndSelectElement(this.titleEl);
			} else {
				new CssSnippetRenameModal(this.app, this.file).open();
			}
		});
	}

	getViewType() {
		return VIEW_TYPE_CSS;
	}

	getIcon() {
		return "file-code";
	}

	getDisplayText(): string {
		return this.file?.basename ?? "No file open";
	}

	async onOpen(): Promise<void> {
		const timer = window.setInterval(() => {
			this.editor.focus();
			if (this.editor.hasFocus) clearInterval(timer);
		}, 200);
		this.registerInterval(timer);
		if (Platform.isMobileApp) {
			this.titleEl.addEventListener("touchstart", () => {
				this.titleEl.contentEditable = "true";
			});
		} else {
			this.titleEl.contentEditable = "true";
		}
		this.titleEl.addEventListener("focus", this.onTitleFocus.bind(this));
		this.titleEl.addEventListener("blur", this.onTitleBlur.bind(this));
		this.titleEl.addEventListener(
			"keydown",
			this.onTitleKeydown.bind(this)
		);
		this.registerEvent(
			this.app.workspace.on("css-editor-change", async (file, data) => {
				if (
					this.file?.name === file.name &&
					this.getEditorData() !== data
				) {
					this.dispatchEditorData(data);
				}
			})
		);
		this.registerEvent(
			this.app.workspace.on(
				"css-snippet-rename",
				async (file, oldFileName) => {
					if (this.file?.name === oldFileName) {
						this.file = file;
						this.titleEl.setText(this.getDisplayText());
						this.leaf.updateHeader();
						this.app.workspace.requestSaveLayout();
					}
				}
			)
		);
		this.registerEvent(
			this.app.workspace.on("css-change", async (data: unknown) => {
				if (!this.file) return;
				// Ignore changes from style settings plugin
				if (
					typeof data === "object" &&
					data !== null &&
					"source" in data &&
					data?.source === "style-settings"
				) {
					return;
				}
				// Ignore changes from this plugin
				if (this.isEditorDirty) {
					this.isEditorDirty = false;
					return;
				}

				const contents = await readSnippetFile(this.app, this.file);
				if (contents !== this.getEditorData()) {
					this.dispatchEditorData(contents);
				}
			})
		);
		this.registerEvent(
			this.app.workspace.on("leaf-menu", (menu, leaf) => {
				if (leaf === this.leaf && !!this.file) {
					menu.addItem((item) => {
						item.setIcon("lucide-edit-3")
							.setSection("action")
							.setTitle("Rename...")
							.onClick(() => {
								if (this.file) {
									new CssSnippetRenameModal(
										this.app,
										this.file
									).open();
								}
							});
					});
					menu.addItem((item) => {
						const isEnabled = this.isEnabled();
						item.setIcon(
							isEnabled
								? "lucide-toggle-left"
								: "lucide-toggle-right"
						)
							.setSection("action")
							.setTitle(
								isEnabled ? "Disable snippet" : "Enable snippet"
							)
							.onClick(() => {
								if (this.file) {
									toggleSnippetFileState(this.app, this.file);
								}
							});
					});
					menu.addItem((item) => {
						item.setIcon("lucide-trash-2")
							.setSection("danger")
							.setTitle("Delete snippet")
							.setWarning(true)
							.onClick(async () => {
								if (this.file) {
									if (this.plugin.settings.promptDelete) {
										new CssSnippetDeleteConfirmModal(
											this.app,
											this.plugin,
											this.file
										).open();
									} else {
										try {
											await detachCssFileLeaves(
												this.app.workspace,
												this.file
											);
											await deleteSnippetFile(
												this.app,
												this.file
											);
										} catch (err) {
											if (err instanceof Error) {
												new ErrorNotice(err.message);
											} else {
												new ErrorNotice(
													"Failed to delete file. Reason unknown."
												);
											}
										}
									}
								}
							});
					});
				}
			})
		);
	}

	onTitleFocus() {
		this.titleEl.spellcheck =
			this.app.vault.getConfig?.("spellcheck") === true;
	}

	onTitleBlur() {
		this.saveTitle(this.titleEl);
		this.titleEl.spellcheck = false;
		if (Platform.isMobileApp) {
			this.titleEl.contentEditable = "false";
		}
		this.editor.focus();
	}

	onTitleKeydown(event: KeyboardEvent) {
		if (!this.file) return;
		if (event.isComposing) return;
		if (event.key === "Escape") {
			this.titleEl.setText(this.getDisplayText());
			this.titleEl.blur();
		}
		if (event.key === "Enter" || event.key === "Tab") {
			event.preventDefault();
			this.saveTitle(this.titleEl);
			this.titleEl.blur();
		}
	}

	async saveTitle(el: HTMLElement): Promise<void> {
		if (!this.file) return;
		const newTitle = el.getText().trim();
		if (newTitle === this.file.basename) return;
		if (this.isSavingTitle) return;
		this.isSavingTitle = true;
		await renameSnippetFile(this.app, this.file, newTitle);
		this.isSavingTitle = false;
	}

	getEditorData() {
		return this.editor.state.doc.toString();
	}

	dispatchEditorTransaction(...specs: TransactionSpec[]) {
		this.editor.dispatch(...specs);
	}

	private dispatchEditorData(data: string) {
		this.editor.dispatch({
			changes: {
				from: 0,
				to: this.editor.state.doc.length,
				insert: data,
			},
		});
	}

	getState() {
		return {
			file: this.file?.name,
		};
	}

	async setState(state: unknown, result: ViewStateResult): Promise<void> {
		let file: CssFile | null = null;
		if (state && typeof state === "object") {
			if ("filename" in state && typeof state.filename === "string") {
				file = new CssFile(state.filename);
			}
			if ("file" in state) {
				if (state.file instanceof CssFile) {
					file = state.file;
				} else if (typeof state.file === "string") {
					file = new CssFile(state.file);
				}
			}
		}
		if (file) {
			if (file.name !== this.file?.name) {
				try {
					await this.loadFile(file);
				} catch {
					await this.loadFile(null);
				}
			}
		} else {
			await this.loadFile(null);
		}
		result.history = true;
		super.setState({ file: file?.name }, result);
	}

	async loadFile(file: CssFile | null): Promise<void> {
		this.file = file;
		this.titleEl.setText(this.getDisplayText());
		this.leaf.updateHeader();
		const data = file ? await readSnippetFile(this.app, file) : "";
		this.dispatchEditorData(data);
		this.resetHistory();
		this.app.workspace.requestSaveLayout();
	}

	resetHistory() {
		this.editor.dispatch({
			effects: [historyCompartment.reconfigure([])],
		});
		this.editor.dispatch({
			effects: [historyCompartment.reconfigure(history())],
		});
	}

	isEnabled(): boolean {
		if (!this.file) return false;
		const currentState = this.app.customCss?.enabledSnippets?.has(
			this.file.basename
		);
		return currentState || false;
	}

	requestSave = debounce(this.save, 1000);

	/**
	 * You should almost always call `requestSave` instead of `save` to debounce the saving.
	 */
	private async save(data: string): Promise<void> {
		if (this.file) {
			writeSnippetFile(this.app, this.file, data);
		}
	}

	async onClose() {
		this.editor.destroy();
	}
}
