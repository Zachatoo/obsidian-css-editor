import { debounce, ItemView, ViewStateResult, WorkspaceLeaf } from "obsidian";
import { EditorView } from "@codemirror/view";
import { vim } from "@replit/codemirror-vim";
import { CssFile } from "src/CssFile";
import {
	readSnippetFile,
	writeSnippetFile,
} from "../obsidian/file-system-helpers";
import { basicExtensions } from "../codemirror-extensions/basic-extensions";
import { TransactionSpec } from "@codemirror/state";
import CssEditorPlugin, { DEFAULT_SETTINGS } from "src/main";
import { indentSize, lineWrap } from "src/codemirror-extensions/compartments";
import { indentUnit } from "@codemirror/language";

export const VIEW_TYPE_CSS = "css-editor-view";

export class CssEditorView extends ItemView {
	private editor: EditorView;
	private file: CssFile | null = null;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);

		let plugin = this.app.plugins.getPlugin("css-editor"),
			settings = Object.assign({}, DEFAULT_SETTINGS);
		
		if (plugin instanceof CssEditorPlugin) {
			settings = plugin.settings;
		}

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
	}

	getViewType() {
		return VIEW_TYPE_CSS;
	}

	getIcon() {
		return "file-code";
	}

	getDisplayText(): string {
		return this.file?.basename ?? "";
	}

	async onOpen(): Promise<void> {
		const timer = window.setInterval(() => {
			this.editor.focus();
			if (this.editor.hasFocus) clearInterval(timer);
		}, 200);
		this.registerInterval(timer);
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
			if (file && file.name !== this.file?.name) {
				const data = await readSnippetFile(this.app, file);
				this.dispatchEditorData(data);
				this.file = file;
				this.app.workspace.requestSaveLayout();
				result.history = true;
			}
		} else {
			result.history = true;
		}
		super.setState({ file: file?.name }, result);
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
