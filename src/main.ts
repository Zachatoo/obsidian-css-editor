import { Plugin } from "obsidian";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface CSSEditorPluginSettings {}

const DEFAULT_SETTINGS: CSSEditorPluginSettings = {};

export default class CSSEditorPlugin extends Plugin {
	settings: CSSEditorPluginSettings;

	async onload() {
		await this.loadSettings();
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
