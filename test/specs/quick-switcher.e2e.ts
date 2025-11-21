/* eslint-disable import/no-extraneous-dependencies */
import { browser } from "@wdio/globals";
import { obsidianPage } from "wdio-obsidian-service";
import { Key } from "webdriverio";
import QuickSwitcherModal from "../page-objects/QuickSwitcherModal.page";
import CssEditorView from "../page-objects/CssEditorView.page";
import Workspace from "../page-objects/Workspace.page";
import DeleteConfirmModal from "../page-objects/DeleteConfirmModal.page";

describe("quick switcher", function () {
	beforeEach(async () => {
		await browser.keys(Key.Escape); // Close any open modals/menus
		await obsidianPage.loadWorkspaceLayout("empty");
	});

	it("can navigate with arrow keys and close with escape", async () => {
		await QuickSwitcherModal.open();
		const initialSelected =
			await QuickSwitcherModal.selectedSuggestionEl.getText();
		await browser.keys(Key.ArrowDown);
		const newSelected =
			await QuickSwitcherModal.selectedSuggestionEl.getText();
		await expect(newSelected).not.toEqual(initialSelected);
		await browser.keys(Key.ArrowUp);
		const revertedSelected =
			await QuickSwitcherModal.selectedSuggestionEl.getText();
		await expect(revertedSelected).toEqual(initialSelected);
		await browser.keys([Key.Escape]);
		await expect(QuickSwitcherModal.modalEl).not.toBeDisplayed();
	});

	// TODO: Re-enable after fixing
	it.skip("can open with mouse", async () => {
		await QuickSwitcherModal.open();
		await QuickSwitcherModal.selectSuggestionByName(
			"existing-snippet-1.css",
		);
		await expect(Workspace.activeTabEl).toHaveText("existing-snippet-1");
		await expect(CssEditorView.titleEl).toHaveText("existing-snippet-1");
	});

	it("can open with enter", async () => {
		const initialTabCount = await Workspace.getTabCount();
		await QuickSwitcherModal.open();
		await QuickSwitcherModal.inputEl.setValue("existing-snippet-1.css");
		await browser.keys(Key.Enter);
		await expect(Workspace.activeTabEl).toHaveText("existing-snippet-1");
		await expect(CssEditorView.titleEl).toHaveText("existing-snippet-1");
		const finalTabCount = await Workspace.getTabCount();
		await expect(finalTabCount).toBe(initialTabCount);
	});

	it("can open in new tab", async () => {
		// If empty workspace, then opening in new tab will replace active tab
		const initialTabCount = await Workspace.getTabCount();
		await QuickSwitcherModal.open();
		await QuickSwitcherModal.inputEl.setValue("existing-snippet-1.css");
		await browser.keys([Key.Ctrl, Key.Enter]);
		await expect(Workspace.activeTabEl).toHaveText("existing-snippet-1");
		await expect(CssEditorView.titleEl).toHaveText("existing-snippet-1");
		await expect(await Workspace.getTabCount()).toBe(initialTabCount);
		// If not in empty workspace, then opening in new tab will open in new tab
		await QuickSwitcherModal.open();
		await QuickSwitcherModal.inputEl.setValue("existing-snippet-1.css");
		await browser.keys([Key.Ctrl, Key.Enter]);
		await expect(Workspace.activeTabEl).toHaveText("existing-snippet-1");
		await expect(CssEditorView.titleEl).toHaveText("existing-snippet-1");
		await expect(await Workspace.getTabCount()).toBe(initialTabCount + 1);
	});

	it("can create with enter when no fuzzy matches", async () => {
		const uniqueName = `unique-snippet-${Date.now()}`;
		await QuickSwitcherModal.open();
		await QuickSwitcherModal.inputEl.setValue(uniqueName);
		await QuickSwitcherModal.expectNoSnippetsFound();
		await browser.keys(Key.Enter);
		await expect(Workspace.activeTabEl).toHaveText(uniqueName);
		await expect(CssEditorView.titleEl).toHaveText(uniqueName);
	});

	it("can create with shift+enter when fuzzy matches exist", async () => {
		await QuickSwitcherModal.open();
		await QuickSwitcherModal.inputEl.setValue("existing-snippet");
		await expect(QuickSwitcherModal.emptyMessageEl).not.toBeDisplayed();
		await browser.keys([Key.Shift, Key.Enter]);
		await expect(Workspace.activeTabEl).toHaveText("existing-snippet");
		await expect(CssEditorView.titleEl).toHaveText("existing-snippet");
	});

	it("can delete without confirmation", async () => {
		// Disable delete confirmation prompt
		await browser.executeObsidian(
			async ({ plugins }, settings) => {
				Object.assign(plugins.cssEditor.settings, settings);
				await plugins.cssEditor.saveSettings();
			},
			{ promptDelete: false },
		);

		// Create a snippet to delete
		const snippetName = `delete-test-${Date.now()}`;
		await QuickSwitcherModal.open();
		await QuickSwitcherModal.inputEl.setValue(snippetName);
		await browser.keys(Key.Enter);
		await expect(CssEditorView.titleEl).toHaveText(snippetName);

		// Open quick switcher and delete the snippet with Cmd+Delete
		await QuickSwitcherModal.open();
		await QuickSwitcherModal.inputEl.setValue(snippetName);
		await browser.keys([Key.Ctrl, Key.Delete]);
		await QuickSwitcherModal.modalEl.waitForDisplayed({ reverse: true });

		// Verify the quick switcher shows no matches for the deleted snippet
		await QuickSwitcherModal.open();
		await QuickSwitcherModal.inputEl.setValue(snippetName);
		await QuickSwitcherModal.expectNoSnippetsFound();
	});

	it("can delete with confirmation", async () => {
		// Ensure delete confirmation prompt is enabled
		await browser.executeObsidian(
			async ({ plugins }, settings) => {
				Object.assign(plugins.cssEditor.settings, settings);
				await plugins.cssEditor.saveSettings();
			},
			{ promptDelete: true },
		);

		// Create a snippet to delete
		const snippetName = `delete-test-2-${Date.now()}`;
		await QuickSwitcherModal.open();
		await QuickSwitcherModal.inputEl.setValue(snippetName);
		await browser.keys(Key.Enter);
		await expect(CssEditorView.titleEl).toHaveText(snippetName);

		// Open quick switcher and trigger delete - should show confirmation modal
		await QuickSwitcherModal.open();
		await QuickSwitcherModal.inputEl.setValue(snippetName);
		await browser.keys([Key.Ctrl, Key.Delete]);
		await QuickSwitcherModal.modalEl.waitForDisplayed({ reverse: true });

		// Confirm deletion using the modal
		await DeleteConfirmModal.confirmDelete();

		// Verify deletion
		await QuickSwitcherModal.open();
		await QuickSwitcherModal.inputEl.setValue(snippetName);
		await QuickSwitcherModal.expectNoSnippetsFound();
	});

	it("can toggle status with tab", async () => {
		await QuickSwitcherModal.open();
		await QuickSwitcherModal.toggleSelectedSuggestionStatus("keyboard");
		await QuickSwitcherModal.toggleSelectedSuggestionStatus("keyboard");
	});

	it("can toggle status with mouse", async () => {
		await QuickSwitcherModal.open();
		await QuickSwitcherModal.toggleSelectedSuggestionStatus("mouse");
		await QuickSwitcherModal.toggleSelectedSuggestionStatus("mouse");
	});
});
