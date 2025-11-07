import { obsidianPage } from "wdio-obsidian-service";
import CreateModal from "../page-objects/CreateModal.page";
import CssEditorView from "../page-objects/CssEditorView.page";

describe("create modal", function () {
	beforeEach(async () => {
		await obsidianPage.loadWorkspaceLayout("empty");
	});

	it("can create snippet", async () => {
		await CreateModal.open();
		await CreateModal.enterSnippetName("can create snippet.css");
		await CreateModal.save();
		await expect(CssEditorView.titleEl).toHaveText("can create snippet");
	});

	it("can cancel creating snippet", async () => {
		await CreateModal.open();
		await CreateModal.enterSnippetName("can cancel creating snippet.css");
		await CreateModal.cancel();
		await expect(CssEditorView.activeEditorEl).not.toExist();
	});
});
