/* eslint-disable import/no-extraneous-dependencies */
import { browser } from "@wdio/globals";
import { obsidianPage } from "wdio-obsidian-service";
import { Key } from "webdriverio";
import QuickSwitcherModal from "../page-objects/QuickSwitcherModal.page";
import CssEditorView from "../page-objects/CssEditorView.page";
import Workspace from "../page-objects/Workspace.page";

describe("quick switcher", function () {
	beforeEach(async () => {
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
		await browser.keys([Key.Command, Key.Enter]);
		await expect(Workspace.activeTabEl).toHaveText("existing-snippet-1");
		await expect(CssEditorView.titleEl).toHaveText("existing-snippet-1");
		await expect(await Workspace.getTabCount()).toBe(initialTabCount);
		// If not in empty workspace, then opening in new tab will open in new tab
		await QuickSwitcherModal.open();
		await QuickSwitcherModal.inputEl.setValue("existing-snippet-1.css");
		await browser.keys([Key.Command, Key.Enter]);
		await expect(Workspace.activeTabEl).toHaveText("existing-snippet-1");
		await expect(CssEditorView.titleEl).toHaveText("existing-snippet-1");
		await expect(await Workspace.getTabCount()).toBe(initialTabCount + 1);
	});

	// TODO: Implement
	it.skip("can create with shift", async () => {});

	// TODO: Implement
	it.skip("can delete without confirmation", async () => {});

	// TODO: Implement
	it.skip("can delete with confirmation", async () => {});

	// TODO: Re-enable after fixing
	it.skip("can toggle status with tab", async () => {
		await QuickSwitcherModal.open();
		await QuickSwitcherModal.toggleSelectedSuggestionStatus("keyboard");
		await QuickSwitcherModal.toggleSelectedSuggestionStatus("keyboard");
	});

	// TODO: Re-enable after fixing
	it.skip("can toggle status with mouse", async () => {
		await QuickSwitcherModal.open();
		await QuickSwitcherModal.toggleSelectedSuggestionStatus("mouse");
		await QuickSwitcherModal.toggleSelectedSuggestionStatus("mouse");
	});
});
