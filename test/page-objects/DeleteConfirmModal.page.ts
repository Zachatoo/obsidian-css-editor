class DeleteConfirmModal {
	get modalEl() {
		return browser.$(".css-editor-delete-confirm-modal");
	}
	get deleteButtonEl() {
		return this.modalEl.$("button.mod-warning");
	}
	get cancelButtonEl() {
		return this.modalEl.$("button=Cancel");
	}
	get dontAskAgainCheckboxEl() {
		return this.modalEl.$('input[type="checkbox"]');
	}

	async confirmDelete(dontAskAgain = false) {
		await this.modalEl.waitForDisplayed();
		if (dontAskAgain) {
			await this.dontAskAgainCheckboxEl.click();
		}
		await this.deleteButtonEl.waitForClickable();
		await this.deleteButtonEl.click();
		await this.modalEl.waitForDisplayed({ reverse: true });
	}

	async cancel() {
		await this.modalEl.waitForDisplayed();
		await this.cancelButtonEl.waitForClickable();
		await this.cancelButtonEl.click();
		await this.modalEl.waitForDisplayed({ reverse: true });
	}
}

export default new DeleteConfirmModal();
