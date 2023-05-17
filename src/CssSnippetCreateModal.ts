import { App, Modal, TextComponent } from "obsidian";
import { CssEditorView } from "./CssEditorView";
import { writeSnippetFile } from "./file-system-helpers";
import { ErrorNotice } from "./Notice";

export class CssSnippetCreateModal extends Modal {
	private value: string;

	constructor(app: App) {
		super(app);
		this.value = "";
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
				await writeSnippetFile(this.app, this.value, "");
				const leaf = this.app.workspace.getLeaf();
				leaf.open(new CssEditorView(leaf, this.value));
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
