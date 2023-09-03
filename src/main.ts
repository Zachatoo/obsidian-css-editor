import { Plugin } from "obsidian";
import { CssEditorView, VIEW_TYPE_CSS } from "./CssEditorView";
import { CssSnippetFuzzySuggestModal } from "./modals/CssSnippetFuzzySuggestModal";
import { CssSnippetCreateModal } from "./modals/CssSnippetCreateModal";
import { deleteSnippetFile } from "./file-system-helpers";
import { detachLeavesOfTypeAndDisplay, openView } from "./workspace-helpers";
import { InfoNotice } from "./Notice";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface CssEditorPluginSettings {}

const DEFAULT_SETTINGS: CssEditorPluginSettings = {};

export default class CssEditorPlugin extends Plugin {
	settings: CssEditorPluginSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: "edit-css-snippet",
			name: "Edit CSS Snippet",
			callback: async () => {
				new CssSnippetFuzzySuggestModal(
					this.app,
					this.openCssEditorView
				).open();
			},
		});
		this.addCommand({
			id: "create-css-snippet",
			name: "Create CSS Snippet",
			callback: async () => {
				new CssSnippetCreateModal(this.app, this).open();
			},
		});
		this.addCommand({
			id: "delete-css-snippet",
			name: "Delete CSS Snippet",
			callback: async () => {
				new CssSnippetFuzzySuggestModal(this.app, (item) => {
					deleteSnippetFile(this.app, item);
					detachLeavesOfTypeAndDisplay(
						this.app.workspace,
						VIEW_TYPE_CSS,
						item
					);
					new InfoNotice(`${item} was deleted.`);
				}).open();
			},
		});

		this.registerView(VIEW_TYPE_CSS, (leaf) => new CssEditorView(leaf));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async openCssEditorView(filename: string, evt: MouseEvent | KeyboardEvent) {
		openView(this.app.workspace, VIEW_TYPE_CSS, evt, { filename });
	}
}
