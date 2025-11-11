class CreateModal {
	get modalEl() {
		return browser.$(".css-editor-create-modal");
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

	async open() {
		await browser.executeObsidianCommand("css-editor:create-css-snippet");
		await this.modalEl.waitForDisplayed();
	}

	async enterSnippetName(name: string) {
		await this.inputEl.waitForDisplayed();
		await this.inputEl.addValue(name);
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

export default new CreateModal();
