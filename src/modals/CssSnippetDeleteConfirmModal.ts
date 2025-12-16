import { App, Modal, ButtonComponent } from "obsidian";
import { CssFile } from "src/CssFile";
import CssEditorPlugin from "src/main";
import { handleError } from "src/utils/handle-error";
import { deleteSnippet } from "src/utils/delete-snippet";

export class CssSnippetDeleteConfirmModal extends Modal {
	private plugin: CssEditorPlugin;
	private file: CssFile;

	constructor(app: App, plugin: CssEditorPlugin, file: CssFile) {
		super(app);
		this.plugin = plugin;
		this.file = file;
	}

	async onOpen() {
		await super.onOpen();
		this.titleEl.setText("Delete CSS snippet");
		this.containerEl.addClass("css-editor-delete-confirm-modal");
		this.buildForm();
	}

	private buildForm() {
		this.contentEl.createEl("p", {
			text: `Are you sure you want to delete "${this.file.name}"?`,
		});
		this.contentEl.createEl("p", {
			text: "This action cannot be undone.",
		});
		const buttonContainer = this.contentEl.createDiv(
			"modal-button-container",
		);
		const dontAskAgainLabel = buttonContainer.createEl("label", {
			cls: "mod-checkbox",
		});
		const dontAskAgainCheckbox = dontAskAgainLabel.createEl("input", {
			type: "checkbox",
		});
		dontAskAgainCheckbox.insertAdjacentText("afterend", "Don't ask again");
		new ButtonComponent(buttonContainer)
			.setButtonText("Delete")
			.setWarning()
			.onClick(() => this.delete());
		new ButtonComponent(buttonContainer)
			.setButtonText("Cancel")
			.onClick(() => this.close());
	}

	private async delete() {
		try {
			const dontAskAgain = this.contentEl.querySelector(
				'input[type="checkbox"]',
			) as HTMLInputElement;
			if (dontAskAgain?.checked) {
				this.plugin.settings.promptDelete = false;
				await this.plugin.saveSettings();
			}
			await deleteSnippet(this.app, this.file);
			this.close();
		} catch (err) {
			handleError(err, "Failed to delete CSS file.");
		}
	}
}
