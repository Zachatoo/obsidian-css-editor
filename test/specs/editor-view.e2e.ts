/* eslint-disable import/no-extraneous-dependencies */
import { browser } from "@wdio/globals";
import { obsidianPage } from "wdio-obsidian-service";
import { Key } from "webdriverio";
import QuickSwitcherModal from "../page-objects/QuickSwitcherModal.page";
import CssEditorView from "../page-objects/CssEditorView.page";
import RenameModal from "../page-objects/RenameModal.page";
import Workspace from "../page-objects/Workspace.page";

describe("editor view", function () {
	beforeEach(async () => {
		await obsidianPage.loadWorkspaceLayout("empty");
	});

	it("can rename with f2 keybind", async () => {
		await QuickSwitcherModal.open();
		await QuickSwitcherModal.inputEl.setValue("existing-snippet-1.css");
		await browser.keys(Key.Enter);
		await expect(CssEditorView.titleEl).toHaveText("existing-snippet-1");

		const newName = `renamed-snippet-${Date.now()}`;
		await browser.keys(Key.F2);
		await CssEditorView.titleEl.waitForClickable();
		await CssEditorView.titleEl.click();
		await browser.keys([Key.Ctrl, "a"]); // Select all
		await browser.keys(newName);
		await browser.keys(Key.Enter);

		await expect(Workspace.activeTabEl).toHaveText(newName);
		await expect(CssEditorView.titleEl).toHaveText(newName);
	});

	it("can rename with view header action", async () => {
		await QuickSwitcherModal.open();
		await QuickSwitcherModal.inputEl.setValue("existing-snippet-1.css");
		await browser.keys(Key.Enter);
		await expect(CssEditorView.titleEl).toHaveText("existing-snippet-1");

		const newName = `renamed-snippet-${Date.now()}`;
		await CssEditorView.moreOptionsButtonEl.click();
		await CssEditorView.renameMenuItemEl.click();
		await RenameModal.enterSnippetName(newName);
		await RenameModal.save();

		await expect(Workspace.activeTabEl).toHaveText(newName);
		await expect(CssEditorView.titleEl).toHaveText(newName);
	});

	// TODO: Implement
	it.skip("can toggle status with command", async () => {});

	// TODO: Implement
	it.skip("can toggle status with view header action", async () => {});

	// TODO: Implement
	it.skip("can delete with command without confirmation", async () => {});

	// TODO: Implement
	it.skip("can delete with command with confirmation", async () => {});

	// TODO: Implement
	it.skip("can delete with view header action without confirmation", async () => {});

	// TODO: Implement
	it.skip("can delete with view header action with confirmation", async () => {});

	// TODO: Implement
	it.skip("respects line wrap setting", async () => {});

	// TODO: Implement
	it.skip("respects indent size setting", async () => {});

	// TODO: Implement
	it.skip("respects relative line numbers setting", async () => {});
});
