import { App, ButtonComponent, Modal, TextComponent } from "obsidian";
import { renameSnippetFile } from "src/obsidian/file-system-helpers";
import { CssFile } from "src/CssFile";
import { handleError } from "src/utils/handle-error";

export class CssSnippetRenameModal extends Modal {
	private value: string;
	private file: CssFile;

	constructor(app: App, file: CssFile) {
		super(app);
		this.value = "";
		this.file = file;
	}

	async onOpen() {
		await super.onOpen();
		this.titleEl.setText("Rename CSS snippet");
		this.containerEl.addClass("css-editor-rename-modal");
		this.buildForm();
	}

	private buildForm() {
		const textInput = new TextComponent(this.contentEl);
		textInput.setPlaceholder("CSS snippet file name (ex: snippet.css)");
		textInput.setValue(this.file.basename);
		textInput.onChange((val) => (this.value = val));
		textInput.inputEl.addEventListener("keydown", (evt) => {
			this.handleKeydown(evt);
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

	private handleKeydown(evt: KeyboardEvent) {
		if (evt.key === "Escape") {
			this.close();
		} else if (evt.key === "Enter") {
			this.save().catch((err) => {
				handleError(err, "Failed to rename CSS file.");
			});
		}
	}

	private async save() {
		try {
			await renameSnippetFile(this.app, this.file, this.value);
			this.close();
		} catch (err) {
			handleError(err, "Failed to rename CSS file.");
		}
	}
}
