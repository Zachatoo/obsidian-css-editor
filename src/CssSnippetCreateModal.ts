import { Modal, Notice, TextComponent } from "obsidian";
import { CSSEditorView } from "./CssEditorView";
import { checkSnippetExists, writeSnippetFile } from "./file-system-helpers";

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
			const errors = await this.validate(this.value);
			if (Object.values(errors).every((x) => x === "")) {
				await writeSnippetFile(this.app, this.value, "");
				const leaf = this.app.workspace.getLeaf();
				leaf.open(new CSSEditorView(leaf, this.value));
				this.close();
			} else {
				const messages = Object.values(errors)
					.filter((x) => x !== "")
					.reduce(
						(acc, curr) => `${acc}\n${curr}`,
						"Failed to create CSS snippet."
					);
				new Notice(messages);
			}
		}
	}

	private async validate(value: string) {
		const errors = {
			exists: "",
			regex: "",
		};
		if (await checkSnippetExists(this.app, value)) {
			errors.exists = "File already exists.";
		}
		const regex = /^[0-9a-zA-Z\-_]+\.css$/;
		if (!regex.test(value)) {
			errors.regex =
				"Must end with .css and only contain alphanumeric, dashes, and underscore characters.";
		}
		return errors;
	}
}
