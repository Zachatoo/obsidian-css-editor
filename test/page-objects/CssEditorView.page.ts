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
}

export default new CssEditorView();
