import { Plugin } from "obsidian";
import { CssEditorView, VIEW_TYPE_CSS } from "src/views/CssEditorView";
import { CssSnippetFuzzySuggestModal } from "src/modals/CssSnippetFuzzySuggestModal";
import { ignoreObsidianHotkey } from "src/obsidian/ignore-obsidian-hotkey";
import {
	createSnippetFile,
	deleteSnippetFile,
	toggleSnippetFileState,
} from "./obsidian/file-system-helpers";
import { detachCssFileLeaves, openView } from "./obsidian/workspace-helpers";
import { InfoNotice } from "./obsidian/Notice";
import { CssSnippetCreateModal } from "./modals/CssSnippetCreateModal";
import { CssFile } from "./CssFile";
import { CSSEditorSettingTab } from "./obsidian/setting-tab";

export interface CssEditorPluginSettings {
	lineWrap: boolean;
	indentSize: number;
}

export const DEFAULT_SETTINGS: CssEditorPluginSettings = {
	lineWrap: true,
	indentSize: 2,
};

export default class CssEditorPlugin extends Plugin {
	settings: CssEditorPluginSettings;
	settingTab: CSSEditorSettingTab;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: "create-css-snippet",
			name: "Create CSS Snippet",
			callback: async () => {
				new CssSnippetCreateModal(this.app, this).open();
			},
		});
		this.addCommand({
			id: "open-quick-switcher",
			name: "Open quick switcher",
			callback: async () => {
				new CssSnippetFuzzySuggestModal(this.app, this).open();
			},
		});
		this.addCommand({
			id: "delete-css-snippet",
			name: "Delete current CSS Snippet",
			checkCallback: (checking) => {
				const activeCssEditorView =
					this.app.workspace.getActiveViewOfType(CssEditorView);
				if (!activeCssEditorView) return false;
				if (checking) return true;
				const { file } = activeCssEditorView.getState();
				if (!file) return;
				const cssFile = new CssFile(file);
				detachCssFileLeaves(this.app.workspace, cssFile).then(
					async () => {
						await deleteSnippetFile(this.app, cssFile);
						new InfoNotice(`"${cssFile.name}" was deleted.`);
					}
				);
			},
		});
		this.addCommand({
			id: "toggle-css-snippet-enabled-status",
			name: "Toggle the enabled/disabled state of current CSS snippet",
			checkCallback: (checking) => {
				const activeCssEditorView =
					this.app.workspace.getActiveViewOfType(CssEditorView);
				if (!activeCssEditorView) return false;
				if (checking) return true;
				const { file } = activeCssEditorView.getState();
				if (!file) return;
				const cssFile = new CssFile(file);
				const isEnabled = toggleSnippetFileState(this.app, cssFile);
				new InfoNotice(
					`"${cssFile.name}" is now ${
						isEnabled ? "enabled" : "disabled"
					}.`
				);
			},
		});

		this.register(
			ignoreObsidianHotkey(
				{ key: "/", modifiers: "Meta" },
				() => !!this.app.workspace.getActiveViewOfType(CssEditorView)
			)
		);

		this.registerView(VIEW_TYPE_CSS, (leaf) => new CssEditorView(leaf, this));
		
		this.settingTab = new CSSEditorSettingTab(this.app, this);
		this.addSettingTab(this.settingTab);
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

	async createAndOpenSnippet(filename: string, openInNewTab: boolean) {
		const file = await createSnippetFile(this.app, filename, "");
		this.app.customCss?.setCssEnabledStatus?.(file.basename, true);
		new InfoNotice(`${file.name} was created.`);
		openView(this.app.workspace, VIEW_TYPE_CSS, openInNewTab, {
			file,
		});
	}
}
