/* eslint-disable import/no-extraneous-dependencies */
import { browser } from "@wdio/globals";
import { obsidianPage } from "wdio-obsidian-service";
import { Key } from "webdriverio";
import QuickSwitcherModal from "../page-objects/QuickSwitcherModal.page";
import CssEditorView from "../page-objects/CssEditorView.page";

describe("quick switcher", function () {
	beforeEach(async () => {
		await obsidianPage.loadWorkspaceLayout("empty");
	});

	it("can navigate with arrow keys", async () => {
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
	});

	// TODO: Re-enable after fixing
	it.skip("can open with mouse", async () => {
		await QuickSwitcherModal.open();
		await QuickSwitcherModal.selectSuggestionByName(
			"existing-snippet-1.css",
		);
		await expect(CssEditorView.titleEl).toHaveText("existing-snippet-1");
	});

	// TODO: Implement
	it.skip("can open with enter", async () => {});

	// TODO: Implement
	it.skip("can open in new tab", async () => {});

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

	// TODO: Implement
	it.skip("can close with escape", async () => {});
});
