import { App, ConfirmationModal, Platform } from "obsidian";
import { CssFile } from "src/CssFile";
import CssEditorPlugin from "src/main";
import { handleError } from "src/utils/handle-error";
import { deleteSnippet } from "src/utils/delete-snippet";

export class CssSnippetDeleteConfirmModal extends ConfirmationModal {
	private onDone: (deleted: boolean) => void;
	private deleted = false;

	constructor(
		app: App,
		plugin: CssEditorPlugin,
		file: CssFile,
		onDone: (deleted: boolean) => void,
	) {
		super(app);
		this.onDone = onDone;
		this.setTitle("Delete CSS snippet");
		this.modalEl.addClass("css-editor-delete-confirm-modal");
		this.contentEl.createEl("p", {
			text: `Are you sure you want to delete "${file.name}"?`,
		});
		this.contentEl.createEl("p", {
			text: "This action cannot be undone.",
		});

		let dontAskAgain = false;
		if (!Platform.isMobile) {
			this.addCheckbox("Don't ask again", (checked) => {
				dontAskAgain = checked;
			});
		}

		this.addButton((btn) => {
			btn.setButtonText("Delete")
				.setDestructive()
				.setCta()
				.onClick(async () => {
					try {
						if (dontAskAgain) {
							plugin.settings.promptDelete = false;
							await plugin.saveSettings();
						}
						await deleteSnippet(app, file);
						this.deleted = true;
						return false;
					} catch (err) {
						handleError(err, "Failed to delete CSS file.");
						// Keep the modal open so the user can retry or cancel.
						return true;
					}
				});
		});

		this.addCancelButton();
	}

	onClose() {
		super.onClose();
		this.onDone(this.deleted);
	}
}
