import { App, ButtonComponent, Modal, TextComponent } from "obsidian";
import CssEditorPlugin from "src/main";
import { handleError } from "src/utils/handle-error";

export class CssSnippetCreateModal extends Modal {
	private value: string;
	private plugin: CssEditorPlugin;

	constructor(app: App, plugin: CssEditorPlugin) {
		super(app);
		this.value = "";
		this.plugin = plugin;
	}

	async onOpen() {
		await super.onOpen();
		this.titleEl.setText("Create CSS snippet");
		this.containerEl.addClass("css-editor-create-modal");
		this.buildForm();
	}

	private buildForm() {
		const textInput = new TextComponent(this.contentEl);
		textInput.setPlaceholder("CSS snippet file name (ex: snippet.css)");
		textInput.onChange((val) => (this.value = val));
		textInput.inputEl.addEventListener("keydown", (evt) => {
			this.handleKeydown(evt).catch(handleError);
		});
		const buttonContainer = this.contentEl.createDiv(
			"modal-button-container",
		);
		new ButtonComponent(buttonContainer)
			.setButtonText("Save")
			.setCta()
			.onClick(() => this.save());
		new ButtonComponent(buttonContainer)
			.setButtonText("Cancel")
			.onClick(() => this.close());
	}

	private async handleKeydown(evt: KeyboardEvent) {
		if (evt.key === "Escape") {
			this.close();
		} else if (evt.key === "Enter") {
			await this.save(evt.metaKey);
		}
	}

	private async save(openInNewTab = false) {
		try {
			await this.plugin.createAndOpenSnippet(this.value, openInNewTab);
			this.close();
		} catch (err) {
			handleError(err, "Failed to create and open CSS file.");
		}
	}
}
