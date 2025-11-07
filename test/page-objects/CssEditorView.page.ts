class CssEditorView {
	get activeEditorEl() {
		return browser.$(
			".workspace-leaf.mod-active .workspace-leaf-content[data-type=css-editor-view]",
		);
	}
	get titleEl() {
		return this.activeEditorEl.$(".view-header-title");
	}
}

export default new CssEditorView();
