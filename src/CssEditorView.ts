import { TextFileView, WorkspaceLeaf } from "obsidian";
import { readSnippetFile, writeSnippetFile } from "./file-system-helpers";
import { EditorView, ViewUpdate } from "@codemirror/view";
import { basicExtensions } from "./basic-extensions";

export const VIEW_TYPE_CSS = "css-editor-view";

export class CSSEditorView extends TextFileView {
	editor: EditorView;
	fileName: string;

	constructor(leaf: WorkspaceLeaf, fileName: string) {
		super(leaf);
		this.fileName = fileName;
		this.editor = new EditorView({
			parent: this.contentEl,
			extensions: [
				basicExtensions,
				EditorView.updateListener.of((update) => {
					this.onUpdate(update);
				}),
			],
		});
		readSnippetFile(this.app, fileName).then((data) => {
			this.setViewData(data, false);
		});
	}

	onUpdate(update: ViewUpdate) {
		if (update.docChanged) {
			this.updateData(update.state.doc.toString());
		}
	}

	getViewData() {
		return this.editor.state.doc.toString();
	}

	setViewData(data: string, clear: boolean) {
		this.editor.dispatch({
			changes: {
				from: 0,
				to: this.editor.state.doc.length,
				insert: data,
			},
		});
	}

	clear() {
		this.data = "";
		this.editor.destroy();
	}

	getViewType() {
		return VIEW_TYPE_CSS;
	}

	getIcon() {
		return "file-code";
	}

	getDisplayText(): string {
		return this.file?.name || this.fileName;
	}

	updateData(data: string) {
		this.data = data;
		this.requestSave();
	}

	async save(clear?: boolean | undefined): Promise<void> {
		super.save(clear);
		if (this.fileName) {
			writeSnippetFile(this.app, this.fileName, this.data);
		}
	}
}
