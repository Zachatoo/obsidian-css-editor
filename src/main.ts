import { Plugin } from "obsidian";
import { CssEditorView, VIEW_TYPE_CSS } from "./CssEditorView";
import { CssSnippetFuzzySuggestModal } from "./modals/CssSnippetFuzzySuggestModal";
import { CssSnippetCreateModal } from "./modals/CssSnippetCreateModal";

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

		this.registerView(VIEW_TYPE_CSS, (leaf) => new CssEditorView(leaf, ""));

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
