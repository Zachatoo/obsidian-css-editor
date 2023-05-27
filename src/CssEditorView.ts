import { ItemView, ViewStateResult, WorkspaceLeaf } from "obsidian";
import { readSnippetFile, writeSnippetFile } from "./file-system-helpers";
import { EditorView } from "@codemirror/view";
import { basicExtensions } from "./basic-extensions";

export const VIEW_TYPE_CSS = "css-editor-view";

export class CssEditorView extends ItemView {
	private editor: EditorView;
	private filename: string;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
		this.editor = new EditorView({
			parent: this.contentEl,
			extensions: [
				basicExtensions,
				EditorView.updateListener.of((update) => {
					if (update.docChanged) {
						this.save(update.state.doc.toString());
					}
				}),
			],
		});
		this.filename = "";
	}

	getViewType() {
		return VIEW_TYPE_CSS;
	}

	getIcon() {
		return "file-code";
	}

	getDisplayText(): string {
		return this.filename;
	}

	async onOpen(): Promise<void> {
		const filename = this.getState()?.filename;
		if (filename) {
			this.filename = filename;
			const data = await readSnippetFile(this.app, filename);
			this.dispatchEditorData(data);
			this.app.workspace.requestSaveLayout();
		}
		const timer = window.setInterval(() => {
			this.editor.focus();
			if (this.editor.hasFocus) clearInterval(timer);
		}, 200);
		this.registerInterval(timer);
	}

	getEditorData() {
		return this.editor.state.doc.toString();
	}

	dispatchEditorData(data: string) {
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
			filename: this.filename,
		};
	}

	async setState(
		state: { filename: string },
		result: ViewStateResult
	): Promise<void> {
		if (state && typeof state === "object") {
			if (
				"filename" in state &&
				state.filename &&
				typeof state.filename === "string"
			) {
				if (state.filename !== this.filename) {
					const data = await readSnippetFile(
						this.app,
						state.filename
					);
					this.dispatchEditorData(data);
				}
				this.filename = state.filename;
			}
		}
		super.setState(state, result);
	}

	async save(data: string): Promise<void> {
		if (this.filename) {
			writeSnippetFile(this.app, this.filename, data);
		}
	}

	async onClose() {
		this.editor.destroy();
	}
}
