/* eslint-disable import/no-extraneous-dependencies */
import { browser } from "@wdio/globals";
import { obsidianPage } from "wdio-obsidian-service";
import { Key } from "webdriverio";
import QuickSwitcherModal from "../page-objects/QuickSwitcherModal.page";
import CssEditorView from "../page-objects/CssEditorView.page";
import RenameModal from "../page-objects/RenameModal.page";
import Workspace from "../page-objects/Workspace.page";
import Notice from "../page-objects/Notice.page";

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
		await Notice.dismissAll();
		await CssEditorView.moreOptionsButtonEl.waitForClickable();
		await CssEditorView.moreOptionsButtonEl.click();
		await CssEditorView.renameMenuItemEl.waitForClickable();
		await CssEditorView.renameMenuItemEl.click();
		await RenameModal.enterSnippetName(newName);
		await RenameModal.save();

		await expect(Workspace.activeTabEl).toHaveText(newName);
		await expect(CssEditorView.titleEl).toHaveText(newName);
	});

	it("can toggle status with command", async () => {
		// Open an existing snippet
		await QuickSwitcherModal.open();
		await QuickSwitcherModal.inputEl.setValue("existing-snippet-1.css");
		await browser.keys(Key.Enter);
		await expect(CssEditorView.titleEl).toHaveText("existing-snippet-1");

		// Check initial state by opening menu
		await Notice.dismissAll();
		await CssEditorView.moreOptionsButtonEl.waitForClickable();
		await CssEditorView.moreOptionsButtonEl.click();
		const initialIsEnabled =
			await CssEditorView.disableSnippetMenuItemEl.isDisplayed();
		await browser.keys(Key.Escape); // Close menu

		// Toggle status with command
		await browser.executeObsidianCommand(
			"css-editor:toggle-css-snippet-enabled-status",
		);

		// Verify status changed
		await Notice.dismissAll();
		await CssEditorView.moreOptionsButtonEl.waitForClickable();
		await CssEditorView.moreOptionsButtonEl.click();
		if (initialIsEnabled) {
			await expect(CssEditorView.enableSnippetMenuItemEl).toBeDisplayed();
		} else {
			await expect(
				CssEditorView.disableSnippetMenuItemEl,
			).toBeDisplayed();
		}
		await browser.keys(Key.Escape); // Close menu

		// Toggle back
		await browser.executeObsidianCommand(
			"css-editor:toggle-css-snippet-enabled-status",
		);

		// Verify it's back to original state
		await Notice.dismissAll();
		await CssEditorView.moreOptionsButtonEl.waitForClickable();
		await CssEditorView.moreOptionsButtonEl.click();
		if (initialIsEnabled) {
			await expect(
				CssEditorView.disableSnippetMenuItemEl,
			).toBeDisplayed();
		} else {
			await expect(CssEditorView.enableSnippetMenuItemEl).toBeDisplayed();
		}
		await browser.keys(Key.Escape); // Close menu
	});

	it("can toggle status with view header action", async () => {
		// Open an existing snippet
		await QuickSwitcherModal.open();
		await QuickSwitcherModal.inputEl.setValue("existing-snippet-1.css");
		await browser.keys(Key.Enter);
		await expect(CssEditorView.titleEl).toHaveText("existing-snippet-1");

		// Check initial state and toggle
		await Notice.dismissAll();
		await CssEditorView.moreOptionsButtonEl.waitForClickable();
		await CssEditorView.moreOptionsButtonEl.click();
		const initialIsEnabled =
			await CssEditorView.disableSnippetMenuItemEl.isDisplayed();
		if (initialIsEnabled) {
			await CssEditorView.disableSnippetMenuItemEl.waitForClickable();
			await CssEditorView.disableSnippetMenuItemEl.click();
		} else {
			await CssEditorView.enableSnippetMenuItemEl.waitForClickable();
			await CssEditorView.enableSnippetMenuItemEl.click();
		}

		// Verify status changed
		await Notice.dismissAll();
		await CssEditorView.moreOptionsButtonEl.click();
		if (initialIsEnabled) {
			await expect(CssEditorView.enableSnippetMenuItemEl).toBeDisplayed();
		} else {
			await expect(
				CssEditorView.disableSnippetMenuItemEl,
			).toBeDisplayed();
		}
		await browser.keys(Key.Escape); // Close menu

		// Toggle back
		await Notice.dismissAll();
		await CssEditorView.moreOptionsButtonEl.waitForClickable();
		await CssEditorView.moreOptionsButtonEl.click();
		if (initialIsEnabled) {
			await CssEditorView.enableSnippetMenuItemEl.waitForClickable();
			await CssEditorView.enableSnippetMenuItemEl.click();
		} else {
			await CssEditorView.disableSnippetMenuItemEl.waitForClickable();
			await CssEditorView.disableSnippetMenuItemEl.click();
		}

		// Verify it's back to original state
		await Notice.dismissAll();
		await CssEditorView.moreOptionsButtonEl.click();
		if (initialIsEnabled) {
			await expect(
				CssEditorView.disableSnippetMenuItemEl,
			).toBeDisplayed();
		} else {
			await expect(CssEditorView.enableSnippetMenuItemEl).toBeDisplayed();
		}
		await browser.keys(Key.Escape); // Close menu
	});

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
