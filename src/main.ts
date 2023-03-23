import { Plugin } from "obsidian";
import { CSSView, VIEW_TYPE_CSS } from "./view";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface CSSEditorPluginSettings {}

const DEFAULT_SETTINGS: CSSEditorPluginSettings = {};

export default class CSSEditorPlugin extends Plugin {
	settings: CSSEditorPluginSettings;

	async onload() {
		await this.loadSettings();

		this.registerView(VIEW_TYPE_CSS, (leaf) => new CSSView(leaf));

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
