class Workspace {
	get activeTabEl() {
		return browser.$(
			".workspace-split.mod-root .workspace-tab-header.mod-active .workspace-tab-header-inner-title",
		);
	}

	get allTabEls() {
		return browser.$$(
			".workspace-split.mod-root .workspace-tab-header .workspace-tab-header-inner-title",
		);
	}

	async getActiveTabTitle(): Promise<string> {
		return this.activeTabEl.getText();
	}

	async getAllTabTitles(): Promise<string[]> {
		const tabs = this.allTabEls;
		const titles: string[] = [];
		for (const tab of tabs) {
			titles.push(await tab.getText());
		}
		return titles;
	}

	async getTabCount(): Promise<number> {
		const tabs = this.allTabEls;
		return tabs.length;
	}
}

export default new Workspace();
