import { obsidianPage } from "wdio-obsidian-service";

describe("editor view", function () {
	beforeEach(async () => {
		await obsidianPage.loadWorkspaceLayout("empty");
	});

	// TODO: Implement
	it.skip("can rename with f2 keybind", async () => {});

	// TODO: Implement
	it.skip("can rename with view header action", async () => {});

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
