import { TextFileView } from "obsidian";
import CSSViewComponent from "./view.svelte";

export const VIEW_TYPE_CSS = "css-editor-view";

export class CSSView extends TextFileView {
	component: CSSViewComponent;

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
}
