import { App, Modal, TextComponent } from "obsidian";
import CssEditorPlugin from "src/main";
import { createSnippetFile } from "../file-system-helpers";
import { ErrorNotice } from "../Notice";

export class CssSnippetCreateModal extends Modal {
	private value: string;
	private plugin: CssEditorPlugin;

	constructor(app: App, plugin: CssEditorPlugin) {
		super(app);
		this.value = "";
		this.plugin = plugin;
	}

	onOpen(): void {
		super.onOpen();
		this.titleEl.setText("Create CSS Snippet");
		this.containerEl.addClass("css-editor-create-modal");
		this.buildForm();
	}

	private buildForm() {
		const textInput = new TextComponent(this.contentEl);
		textInput.setPlaceholder("CSS snippet file name (ex: snippet.css)");
		textInput.onChange((val) => (this.value = val));
		textInput.inputEl.addEventListener("keydown", (evt) => {
			this.handleKeydown(evt);
		});
	}

	private async handleKeydown(evt: KeyboardEvent) {
		if (evt.key === "Escape") {
			this.close();
		} else if (evt.key === "Enter") {
			try {
				await createSnippetFile(this.app, this.value, "");
				await this.plugin.openCssEditorView(this.value);
				this.app.customCss?.setCssEnabledStatus?.(
					this.value.replace(".css", ""),
					true
				);
				this.close();
			} catch (err) {
				if (err instanceof Error) {
					new ErrorNotice(err.message);
				} else {
					new ErrorNotice("Failed to create file. Reason unknown.");
				}
			}
		}
	}
}
