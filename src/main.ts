import { Plugin } from "obsidian";
import { CSSEditorView, VIEW_TYPE_CSS } from "./CssEditorView";
import { CssSnippetFuzzySuggestModal } from "./CssSnippetFuzzySuggestModal";
import { CssSnippetCreateModal } from "./CssSnippetCreateModal";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface CSSEditorPluginSettings {}

const DEFAULT_SETTINGS: CSSEditorPluginSettings = {};

export default class CSSEditorPlugin extends Plugin {
	settings: CSSEditorPluginSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: "edit-css-snippet",
			name: "Edit CSS Snippet",
			callback: async () => {
				new CssSnippetFuzzySuggestModal(app).open();
			},
		});
		this.addCommand({
			id: "create-css-snippet",
			name: "Create CSS Snippet",
			callback: async () => {
				new CssSnippetCreateModal(app).open();
			},
		});

		this.registerView(VIEW_TYPE_CSS, (leaf) => new CSSEditorView(leaf, ""));

		this.registerExtensions(["css"], VIEW_TYPE_CSS);
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
}
