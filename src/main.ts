import { Plugin } from "obsidian";
import { CssEditorView, VIEW_TYPE_CSS } from "src/views/CssEditorView";
import { CssSnippetFuzzySuggestModal } from "src/modals/CssSnippetFuzzySuggestModal";
import { ignoreObsidianHotkey } from "src/obsidian/ignore-obsidian-hotkey";
import { deleteSnippetFile } from "./obsidian/file-system-helpers";
import { detachLeavesOfTypeAndDisplay } from "./obsidian/workspace-helpers";
import { InfoNotice } from "./obsidian/Notice";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface CssEditorPluginSettings {}

const DEFAULT_SETTINGS: CssEditorPluginSettings = {};

export default class CssEditorPlugin extends Plugin {
	settings: CssEditorPluginSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: "open-quick-switcher",
			name: "Open quick switcher",
			callback: async () => {
				new CssSnippetFuzzySuggestModal(this.app).open();
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
					new InfoNotice(`${filename} was deleted.`);
				});
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
}
