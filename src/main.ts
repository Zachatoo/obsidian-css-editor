import { Plugin } from "obsidian";
import { CssEditorView, VIEW_TYPE_CSS } from "src/views/CssEditorView";
import { CssSnippetFuzzySuggestModal } from "src/modals/CssSnippetFuzzySuggestModal";
import { ignoreObsidianHotkey } from "src/obsidian/ignore-obsidian-hotkey";
import {
	createSnippetFile,
	deleteSnippetFile,
	toggleSnippetFileState,
} from "./obsidian/file-system-helpers";
import {
	detachLeavesOfTypeAndDisplay,
	openView,
} from "./obsidian/workspace-helpers";
import { InfoNotice } from "./obsidian/Notice";
import { CssSnippetCreateModal } from "./modals/CssSnippetCreateModal";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface CssEditorPluginSettings {}

const DEFAULT_SETTINGS: CssEditorPluginSettings = {};

export default class CssEditorPlugin extends Plugin {
	settings: CssEditorPluginSettings;

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
				const { filename } = activeCssEditorView.getState();
				deleteSnippetFile(this.app, filename).then(() => {
					detachLeavesOfTypeAndDisplay(
						this.app.workspace,
						VIEW_TYPE_CSS,
						filename
					);
					new InfoNotice(`"${filename}" was deleted.`);
				});
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
				const { filename } = activeCssEditorView.getState();
				const isEnabled = toggleSnippetFileState(this.app, filename);
				new InfoNotice(
					`"${filename}" is now ${
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

	async createAndOpenSnippet(filename: string, openInNewTab: boolean) {
		await createSnippetFile(this.app, filename, "");
		this.app.customCss?.setCssEnabledStatus?.(
			filename.replace(".css", ""),
			true
		);
		new InfoNotice(`${filename} was created.`);
		openView(this.app.workspace, VIEW_TYPE_CSS, openInNewTab, {
			filename,
		});
	}
}
