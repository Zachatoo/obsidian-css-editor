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
	readSnippetFile,
	renameSnippetFile,
	writeSnippetFile,
} from "../obsidian/file-system-helpers";
import { basicExtensions } from "../codemirror-extensions/basic-extensions";
import { TransactionSpec } from "@codemirror/state";
import CssEditorPlugin from "src/main";
import { indentSize, lineWrap } from "src/codemirror-extensions/compartments";
import { indentUnit } from "@codemirror/language";

export const VIEW_TYPE_CSS = "css-editor-view";

export class CssEditorView extends ItemView {
	private editor: EditorView;
	private file: CssFile | null = null;
	private isSavingTitle = false;

	constructor(leaf: WorkspaceLeaf, plugin: CssEditorPlugin) {
		super(leaf);

		const { settings } = plugin;

		this.navigation = true;
		this.editor = new EditorView({
			parent: this.contentEl,
			extensions: [
				basicExtensions,
				lineWrap.of(settings.lineWrap ? EditorView.lineWrapping : []),
				indentSize.of(indentUnit.of("".padEnd(settings.indentSize))),
				this.app.vault.getConfig?.("vimMode") ? vim() : [],
				EditorView.updateListener.of((update) => {
					if (update.docChanged) {
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
			this.titleEl.focus();
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
			this.titleEl.setText(this.file.basename);
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
		if (newTitle === this.file?.basename) return;
		if (this.isSavingTitle) return;
		this.isSavingTitle = true;
		const newFile = await renameSnippetFile(this.app, this.file, newTitle);
		this.file = newFile;
		this.leaf.updateHeader();
		this.app.workspace.requestSaveLayout();
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
			selection: this.editor.state.selection,
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
		const data = file ? await readSnippetFile(this.app, file) : "";
		this.dispatchEditorData(data);
		this.app.workspace.requestSaveLayout();
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
