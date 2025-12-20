class EmptyStateView {
	get contentEl() {
		return browser.$(
			".workspace-leaf.mod-active .workspace-leaf-content[data-type=empty]",
		);
	}
}

export default new EmptyStateView();
