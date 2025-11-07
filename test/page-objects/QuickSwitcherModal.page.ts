/* eslint-disable import/no-extraneous-dependencies */
import { Key } from "webdriverio";

class QuickSwitcherModal {
	get modalEl() {
		return browser.$(".css-editor-quick-switcher-modal");
	}
	get inputEl() {
		return this.modalEl.$("input");
	}
	get suggestionEls() {
		return this.modalEl.$$(".prompt-results .suggestion-item");
	}
	get suggestionEl() {
		return this.modalEl.$(".prompt-results .suggestion-item");
	}
	get selectedSuggestionEl() {
		return this.modalEl.$(".prompt-results .suggestion-item.is-selected");
	}
	get selectedSuggestionStatusEl() {
		return this.selectedSuggestionEl.$(".css-editor-status");
	}

	async open() {
		await browser.executeObsidianCommand("css-editor:open-quick-switcher");
		await this.modalEl.waitForDisplayed();
	}

	async enterSnippetName(name: string) {
		await this.inputEl.waitForDisplayed();
		await this.inputEl.addValue(name);
	}

	async toggleSelectedSuggestionStatus(type: "keyboard" | "mouse") {
		const initialStatus = await this.selectedSuggestionStatusEl.getText();
		if (!(initialStatus === "enabled" || initialStatus === "disabled")) {
			throw new Error(
				`Unexpected initial status: ${initialStatus}. Expected "enabled" or "disabled".`,
			);
		}
		if (type === "keyboard") {
			await browser.keys(Key.Tab);
		} else if (type === "mouse") {
			await this.selectedSuggestionStatusEl.waitForClickable();
			await this.selectedSuggestionStatusEl.click();
		}
		const expectedStatus =
			initialStatus === "enabled" ? "disabled" : "enabled";
		await this.selectedSuggestionStatusEl.waitUntil(async () => {
			return (
				(await this.selectedSuggestionStatusEl.getText()) ===
				expectedStatus
			);
		});
	}

	async selectSuggestionByName(name: string) {
		const foundEl = this.suggestionEl.$(
			`.css-editor-suggestion-name=${name}`,
		);
		await foundEl.waitForClickable();
		await foundEl.click();
		await this.modalEl.waitForDisplayed({ reverse: true });
	}
}

export default new QuickSwitcherModal();
