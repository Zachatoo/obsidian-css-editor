class Notice {
	get noticeEl() {
		return browser.$(".notice-container .notice");
	}

	async dismissAll() {
		let attempts = 0;
		const maxAttempts = 10;

		try {
			while (
				attempts < maxAttempts &&
				this.noticeEl &&
				(await this.noticeEl.isDisplayed())
			) {
				await this.noticeEl.click();
				attempts++;
			}
		} catch {
			// Notice doesn't exist or error occurred, continue
		}
	}
}

export default new Notice();
