/* eslint-disable import/no-extraneous-dependencies */
import { browser } from "@wdio/globals";
import { obsidianPage } from "wdio-obsidian-service";
import { Key } from "webdriverio";
import QuickSwitcherModal from "../page-objects/QuickSwitcherModal.page";
import CssEditorView from "../page-objects/CssEditorView.page";
import RenameModal from "../page-objects/RenameModal.page";
import Workspace from "../page-objects/Workspace.page";
import DeleteConfirmModal from "../page-objects/DeleteConfirmModal.page";

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
		await CssEditorView.selectMenuAction("rename");
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
		await CssEditorView.openMenu();
		const initialIsEnabled =
			await CssEditorView.disableSnippetMenuItemEl.isDisplayed();
		await browser.keys(Key.Escape); // Close menu

		// Toggle status with command
		await browser.executeObsidianCommand(
			"css-editor:toggle-css-snippet-enabled-status",
		);

		// Verify status changed
		await CssEditorView.openMenu();
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
		await CssEditorView.openMenu();
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
		await CssEditorView.openMenu();
		const initialIsEnabled =
			await CssEditorView.disableSnippetMenuItemEl.isDisplayed();
		await browser.keys(Key.Escape); // Close menu to reopen with selectMenuAction

		if (initialIsEnabled) {
			await CssEditorView.selectMenuAction("disable");
		} else {
			await CssEditorView.selectMenuAction("enable");
		}

		// Verify status changed
		await CssEditorView.openMenu();
		if (initialIsEnabled) {
			await expect(CssEditorView.enableSnippetMenuItemEl).toBeDisplayed();
		} else {
			await expect(
				CssEditorView.disableSnippetMenuItemEl,
			).toBeDisplayed();
		}
		await browser.keys(Key.Escape); // Close menu

		// Toggle back
		if (initialIsEnabled) {
			await CssEditorView.selectMenuAction("enable");
		} else {
			await CssEditorView.selectMenuAction("disable");
		}

		// Verify it's back to original state
		await CssEditorView.openMenu();
		if (initialIsEnabled) {
			await expect(
				CssEditorView.disableSnippetMenuItemEl,
			).toBeDisplayed();
		} else {
			await expect(CssEditorView.enableSnippetMenuItemEl).toBeDisplayed();
		}
		await browser.keys(Key.Escape); // Close menu
	});

	it("can delete with command without confirmation", async () => {
		// Disable delete confirmation prompt
		await browser.executeObsidian(
			async ({ plugins }, settings) => {
				Object.assign(plugins.cssEditor.settings, settings);
				await plugins.cssEditor.saveSettings();
			},
			{ promptDelete: false },
		);

		// Create a snippet to delete
		const snippetName = `delete-cmd-test-${Date.now()}`;
		await QuickSwitcherModal.open();
		await QuickSwitcherModal.inputEl.setValue(snippetName);
		await browser.keys(Key.Enter);
		await expect(CssEditorView.titleEl).toHaveText(snippetName);

		// Delete with command
		await browser.executeObsidianCommand("css-editor:delete-css-snippet");

		// Verify deletion - quick switcher should show no matches
		await QuickSwitcherModal.open();
		await QuickSwitcherModal.inputEl.setValue(snippetName);
		await QuickSwitcherModal.expectNoSnippetsFound();
		await browser.keys(Key.Escape);
	});

	it("can delete with command with confirmation", async () => {
		// Ensure delete confirmation prompt is enabled
		await browser.executeObsidian(
			async ({ plugins }, settings) => {
				Object.assign(plugins.cssEditor.settings, settings);
				await plugins.cssEditor.saveSettings();
			},
			{ promptDelete: true },
		);

		// Create a snippet to delete
		const snippetName = `delete-cmd-confirm-test-${Date.now()}`;
		await QuickSwitcherModal.open();
		await QuickSwitcherModal.inputEl.setValue(snippetName);
		await browser.keys(Key.Enter);
		await expect(CssEditorView.titleEl).toHaveText(snippetName);

		// Delete with command - should show confirmation modal
		await browser.executeObsidianCommand("css-editor:delete-css-snippet");

		// Confirm deletion
		await DeleteConfirmModal.confirmDelete();

		// Verify deletion
		await QuickSwitcherModal.open();
		await QuickSwitcherModal.inputEl.setValue(snippetName);
		await QuickSwitcherModal.expectNoSnippetsFound();
		await browser.keys(Key.Escape);
	});

	it("can delete with view header action without confirmation", async () => {
		// Disable delete confirmation prompt
		await browser.executeObsidian(
			async ({ plugins }, settings) => {
				Object.assign(plugins.cssEditor.settings, settings);
				await plugins.cssEditor.saveSettings();
			},
			{ promptDelete: false },
		);

		// Create a snippet to delete
		const snippetName = `delete-view-test-${Date.now()}`;
		await QuickSwitcherModal.open();
		await QuickSwitcherModal.inputEl.setValue(snippetName);
		await browser.keys(Key.Enter);
		await expect(CssEditorView.titleEl).toHaveText(snippetName);

		// Delete with view header action
		await CssEditorView.selectMenuAction("delete");

		// Verify deletion
		await QuickSwitcherModal.open();
		await QuickSwitcherModal.inputEl.setValue(snippetName);
		await QuickSwitcherModal.expectNoSnippetsFound();
		await browser.keys(Key.Escape);
	});

	it("can delete with view header action with confirmation", async () => {
		// Ensure delete confirmation prompt is enabled
		await browser.executeObsidian(
			async ({ plugins }, settings) => {
				Object.assign(plugins.cssEditor.settings, settings);
				await plugins.cssEditor.saveSettings();
			},
			{ promptDelete: true },
		);

		// Create a snippet to delete
		const snippetName = `delete-view-confirm-test-${Date.now()}`;
		await QuickSwitcherModal.open();
		await QuickSwitcherModal.inputEl.setValue(snippetName);
		await browser.keys(Key.Enter);
		await expect(CssEditorView.titleEl).toHaveText(snippetName);

		// Delete with view header action - should show confirmation modal
		await CssEditorView.selectMenuAction("delete");

		// Confirm deletion
		await DeleteConfirmModal.confirmDelete();

		// Verify deletion
		await QuickSwitcherModal.open();
		await QuickSwitcherModal.inputEl.setValue(snippetName);
		await QuickSwitcherModal.expectNoSnippetsFound();
		await browser.keys(Key.Escape);
	});

	// TODO: Implement
	it.skip("respects line wrap setting", async () => {});

	// TODO: Implement
	it.skip("respects indent size setting", async () => {});

	// TODO: Implement
	it.skip("respects relative line numbers setting", async () => {});
});
