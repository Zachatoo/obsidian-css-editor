/* eslint-disable import/no-extraneous-dependencies */
import { obsidianPage } from "wdio-obsidian-service";
import { Key } from "webdriverio";
import CreateModal from "../page-objects/CreateModal.page";
import CssEditorView from "../page-objects/CssEditorView.page";
import Workspace from "test/page-objects/Workspace.page";

describe("create modal", function () {
	beforeEach(async () => {
		await browser.keys(Key.Escape); // Close any open modals/menus
		await obsidianPage.loadWorkspaceLayout("empty");
	});

	it("can create snippet", async () => {
		await CreateModal.open();
		await CreateModal.enterSnippetName("can create snippet.css");
		await CreateModal.save();
		await expect(Workspace.activeTabEl).toHaveText("can create snippet");
		await expect(CssEditorView.titleEl).toHaveText("can create snippet");
	});

	it("can cancel creating snippet", async () => {
		await CreateModal.open();
		await CreateModal.enterSnippetName("can cancel creating snippet.css");
		await CreateModal.cancel();
		await expect(CssEditorView.activeEditorEl).not.toExist();
	});
});
