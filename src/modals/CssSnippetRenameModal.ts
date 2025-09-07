import { App, ButtonComponent, Modal, TextComponent } from "obsidian";
import { ErrorNotice } from "src/obsidian/Notice";
import { renameSnippetFile } from "src/obsidian/file-system-helpers";
import { CssFile } from "src/CssFile";

export class CssSnippetRenameModal extends Modal {
	private value: string;
	private file: CssFile;

	constructor(app: App, file: CssFile) {
		super(app);
		this.value = "";
		this.file = file;
	}

	onOpen(): void {
		super.onOpen();
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
			"modal-button-container"
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
			this.save();
		}
	}

	private async save() {
		try {
			await renameSnippetFile(this.app, this.file, this.value);
			this.close();
		} catch (err) {
			if (err instanceof Error) {
				new ErrorNotice(err.message);
			} else {
				new ErrorNotice("Failed to rename file. Reason unknown.");
			}
		}
	}
}
