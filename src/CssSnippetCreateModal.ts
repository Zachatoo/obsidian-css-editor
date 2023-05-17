import { Modal, Notice, TextComponent } from "obsidian";
import { CSSEditorView } from "./CssEditorView";
import { writeSnippetFile } from "./file-system-helpers";

export class CssSnippetCreateModal extends Modal {
	private value: string;

	onOpen(): void {
		super.onOpen();
		this.titleEl.setText("Create CSS Snippet");
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
				await writeSnippetFile(this.app, this.value, "");
				const leaf = this.app.workspace.getLeaf();
				leaf.open(new CSSEditorView(leaf, this.value));
				this.close();
			} catch (err) {
				if (err instanceof Error) {
					new Notice(err.message);
				} else {
					new Notice("Failed to create file. Reason unknown.");
				}
			}
		}
	}
}
