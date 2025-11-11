import Notice from "./Notice.page";

class CssEditorView {
	get activeEditorEl() {
		return browser.$(
			".workspace-leaf.mod-active .workspace-leaf-content[data-type=css-editor-view]",
		);
	}
	get titleEl() {
		return this.activeEditorEl.$(".view-header-title");
	}
	get moreOptionsButtonEl() {
		return this.activeEditorEl.$(
			'.view-actions .view-action[aria-label="More options"]',
		);
	}
	get menuEl() {
		return browser.$(".menu");
	}
	get renameMenuItemEl() {
		return this.menuEl.$(".menu-item-title=Rename...");
	}
	get enableSnippetMenuItemEl() {
		return this.menuEl.$(".menu-item-title=Enable snippet");
	}
	get disableSnippetMenuItemEl() {
		return this.menuEl.$(".menu-item-title=Disable snippet");
	}
	get deleteMenuItemEl() {
		return this.menuEl.$(".menu-item-title=Delete snippet");
	}

	async openMenu() {
		await Notice.dismissAll();
		await this.moreOptionsButtonEl.waitForClickable();
		await this.moreOptionsButtonEl.click();
	}

	async selectMenuAction(action: "rename" | "enable" | "disable" | "delete") {
		await this.openMenu();

		switch (action) {
			case "rename":
				await this.renameMenuItemEl.waitForClickable();
				await this.renameMenuItemEl.click();
				break;
			case "enable":
				await this.enableSnippetMenuItemEl.waitForClickable();
				await this.enableSnippetMenuItemEl.click();
				break;
			case "disable":
				await this.disableSnippetMenuItemEl.waitForClickable();
				await this.disableSnippetMenuItemEl.click();
				break;
			case "delete":
				await this.deleteMenuItemEl.waitForClickable();
				await this.deleteMenuItemEl.click();
				break;
		}
	}
}

export default new CssEditorView();
