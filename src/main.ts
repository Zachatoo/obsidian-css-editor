import { addIcon, Notice, Plugin } from "obsidian";
import { CssEditorView, VIEW_TYPE_CSS } from "src/views/CssEditorView";
import { CssSnippetFuzzySuggestModal } from "src/modals/CssSnippetFuzzySuggestModal";
import { ignoreObsidianHotkey } from "src/utils/ignore-obsidian-hotkey";
import {
	createSnippetFile,
	toggleSnippetFileState,
} from "./utils/file-system-helpers";
import { openView } from "./utils/workspace-helpers";
import { CssSnippetCreateModal } from "./modals/CssSnippetCreateModal";
import { CssFile } from "./CssFile";
import { CSSEditorSettingTab } from "./settings/CssEditorSettingTab";
import { CssEditorPluginSettings, DEFAULT_SETTINGS } from "./settings/settings";
import { handleError } from "./utils/handle-error";
import { tryDeleteSnippet } from "./utils/delete-snippet";
import icon from "./icons/css-icon.svg";

export default class CssEditorPlugin extends Plugin {
	settings: CssEditorPluginSettings;
	settingTab: CSSEditorSettingTab;

	async onload() {
		await this.loadSettings();

		addIcon("css-editor-logo", icon);

		this.addCommand({
			id: "create-css-snippet",
			name: "Create CSS snippet",
			icon: "file-plus",
			callback: () => {
				new CssSnippetCreateModal(this.app, this).open();
			},
		});
		this.addCommand({
			id: "open-quick-switcher",
			name: "Open quick switcher",
			icon: "file-search",
			callback: () => {
				new CssSnippetFuzzySuggestModal(this.app, this).open();
			},
		});
		this.addCommand({
			id: "delete-css-snippet",
			name: "Delete CSS snippet",
			icon: "trash-2",
			checkCallback: (checking) => {
				const activeCssEditorView =
					this.app.workspace.getActiveViewOfType(CssEditorView);
				if (!activeCssEditorView) return false;
				const { file } = activeCssEditorView.getState();
				if (!file) return false;
				if (checking) return true;
				const cssFile = new CssFile(file);
				tryDeleteSnippet(this, cssFile)
					.then(() => {
						new Notice(`"${cssFile.name}" was deleted.`);
					})
					.catch((err) => {
						handleError(err, "Failed to delete CSS file.");
					});
				return true;
			},
		});
		this.addCommand({
			id: "toggle-css-snippet-enabled-status",
			name: "Toggle the enabled/disabled state of CSS snippet",
			checkCallback: (checking) => {
				const activeCssEditorView =
					this.app.workspace.getActiveViewOfType(CssEditorView);
				if (!activeCssEditorView) return false;
				const { file } = activeCssEditorView.getState();
				if (!file) return false;
				if (checking) return true;
				const cssFile = new CssFile(file);
				const isEnabled = toggleSnippetFileState(this.app, cssFile);
				new Notice(
					`"${cssFile.name}" is now ${
						isEnabled ? "enabled" : "disabled"
					}.`,
				);
				return true;
			},
		});

		this.addRibbonIcon(
			"css-editor-logo",
			"Open CSS editor quick switcher",
			() => {
				new CssSnippetFuzzySuggestModal(this.app, this).open();
			},
		);

		this.register(
			ignoreObsidianHotkey(
				this.app.scope,
				{ key: "/", modifiers: "Meta" },
				() => !!this.app.workspace.getActiveViewOfType(CssEditorView),
			),
		);

		this.registerView(
			VIEW_TYPE_CSS,
			(leaf) => new CssEditorView(leaf, this),
		);

		this.settingTab = new CSSEditorSettingTab(this.app, this);
		this.addSettingTab(this.settingTab);
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Record<string, unknown>,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async createAndOpenSnippet(filename: string, openInNewTab: boolean) {
		const file = await createSnippetFile(this.app, filename, "");
		this.app.customCss?.setCssEnabledStatus?.(file.basename, true);
		new Notice(`${file.name} was created.`);
		await openView(this.app.workspace, VIEW_TYPE_CSS, openInNewTab, {
			file,
		});
	}
}
