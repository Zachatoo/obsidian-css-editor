/* eslint-disable import/no-extraneous-dependencies */
import { browser } from "@wdio/globals";
import { obsidianPage } from "wdio-obsidian-service";

describe("CSS snippet create modal", function () {
	beforeEach(async () => {
		await obsidianPage.loadWorkspaceLayout("empty");
	});
	it("can create snippet", async () => {
		await browser.executeObsidianCommand("css-editor:create-css-snippet");
		const modalEl = browser.$(".css-editor-create-modal");
		await expect(modalEl).toExist();
		const inputEl = modalEl.$("input");
		await expect(inputEl).toExist();
		await inputEl.addValue("can create snippet.css");
		const saveButtonEl = modalEl.$("button.mod-cta");
		await expect(saveButtonEl).toExist();
		await saveButtonEl.click();
		await expect(modalEl).not.toExist();
		const editorViewEl = browser.$(
			".workspace-leaf.mod-active .workspace-leaf-content[data-type=css-editor-view]",
		);
		await expect(editorViewEl).toExist();
		const titleEl = editorViewEl.$(".view-header-title");
		await expect(titleEl).toExist();
		await expect(titleEl).toHaveText("can create snippet");
	});

	it("can cancel creating snippet", async () => {
		await browser.executeObsidianCommand("css-editor:create-css-snippet");
		const modalEl = browser.$(".css-editor-create-modal");
		await expect(modalEl).toExist();
		const inputEl = modalEl.$("input");
		await expect(inputEl).toExist();
		await inputEl.addValue("can cancel creating snippet.css");
		const cancelButtonEl = modalEl.$("button=Cancel");
		await expect(cancelButtonEl).toExist();
		await cancelButtonEl.click();
		await expect(modalEl).not.toExist();
		const editorViewEl = browser.$(
			".workspace-leaf.mod-active .workspace-leaf-content[data-type=css-editor-view]",
		);
		await expect(editorViewEl).not.toExist();
	});
});
