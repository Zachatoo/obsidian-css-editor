import { TextFileView, WorkspaceLeaf } from "obsidian";
import CSSViewComponent from "./CssEditorView.svelte";
import { readSnippetFile, writeSnippetFile } from "./file-system-helpers";

export const VIEW_TYPE_CSS = "css-editor-view";

export class CSSView extends TextFileView {
	component: CSSViewComponent;
	fileName?: string;

	constructor(leaf: WorkspaceLeaf, fileName?: string) {
		super(leaf);
		if (fileName) {
			this.fileName = fileName;
			readSnippetFile(app, fileName).then((data) => {
				this.setViewData(data, false);
			});
		}
	}

	getViewData() {
		return this.data;
	}

	setViewData(data: string, clear: boolean) {
		this.data = data;

		this.component = new CSSViewComponent({
			target: this.contentEl,
			props: {
				data: this.data,
				updateData: (data: string) => this.updateData(data),
			},
		});
	}

	clear() {
		this.data = "";
		this.component.$destroy();
	}

	getViewType() {
		return VIEW_TYPE_CSS;
	}

	updateData(data: string) {
		this.data = data;
		this.requestSave();
	}

	async save(clear?: boolean | undefined): Promise<void> {
		super.save(clear);
		if (this.fileName) {
			writeSnippetFile(app, this.fileName, this.data);
		}
	}
}
