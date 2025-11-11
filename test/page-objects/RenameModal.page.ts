class RenameModal {
	get modalEl() {
		return browser.$(".css-editor-rename-modal");
	}
	get inputEl() {
		return this.modalEl.$("input");
	}
	get saveButtonEl() {
		return this.modalEl.$("button.mod-cta");
	}
	get cancelButtonEl() {
		return this.modalEl.$("button=Cancel");
	}

	async enterSnippetName(name: string) {
		await this.inputEl.waitForDisplayed();
		await this.inputEl.setValue(name);
	}

	async save() {
		await this.saveButtonEl.waitForClickable();
		await this.saveButtonEl.click();
		await this.modalEl.waitForDisplayed({ reverse: true });
	}

	async cancel() {
		await this.cancelButtonEl.waitForClickable();
		await this.cancelButtonEl.click();
		await this.modalEl.waitForDisplayed({ reverse: true });
	}
}

export default new RenameModal();
