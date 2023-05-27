import { expect } from "chai";
import {
	checkSnippetExists,
	createSnippetFile,
	deleteSnippetFile,
	readSnippetFile,
	writeSnippetFile,
} from "src/file-system-helpers";
import TestCssEditorPlugin from "./main.test";

export function fileSystemHelpersTests(testPlugin: TestCssEditorPlugin) {
	testPlugin.test("create/read/update/delete should work", async () => {
		const { app } = testPlugin.plugin;
		const filename = `${Date.now()}crud.css`;
		const mockContent = "this is a test";
		const mockContent2 = "this is a test two";

		await createSnippetFile(app, filename);
		await expect(checkSnippetExists(app, filename)).to.eventually.be.true;

		await writeSnippetFile(app, filename, mockContent);
		await expect(readSnippetFile(app, filename)).to.eventually.equal(
			mockContent
		);

		await writeSnippetFile(app, filename, mockContent2);
		await expect(readSnippetFile(app, filename)).to.eventually.equal(
			mockContent2
		);

		await deleteSnippetFile(app, filename);
		await expect(checkSnippetExists(app, filename)).to.eventually.be.false;
	});

	testPlugin.test(
		"create snippet that already exists should fail",
		async () => {
			const { app } = testPlugin.plugin;
			const filename = `${Date.now()}already-exists.css`;

			await createSnippetFile(app, filename);
			await expect(checkSnippetExists(app, filename)).to.eventually.be
				.true;

			await expect(createSnippetFile(app, filename)).to.be.rejectedWith();

			// cleanup
			await deleteSnippetFile(app, filename);
			await expect(checkSnippetExists(app, filename)).to.eventually.be
				.false;
		}
	);

	testPlugin.test(
		"create snippet that is not .css file should fail",
		async () => {
			const { app } = testPlugin.plugin;
			const filename = `${Date.now()}not-css.txt`;

			await expect(createSnippetFile(app, filename)).to.be.rejectedWith();
			await expect(checkSnippetExists(app, filename)).to.eventually.be
				.false;
		}
	);

	testPlugin.test(
		"create snippet with invalid characters should fail",
		async () => {
			const { app } = testPlugin.plugin;
			const filename = `${Date.now()}invalid/characters.css`;

			await expect(createSnippetFile(app, filename)).to.be.rejectedWith();
			await expect(checkSnippetExists(app, filename)).to.eventually.be
				.false;
		}
	);

	testPlugin.test("create snippet with spaces should succeed", async () => {
		const { app } = testPlugin.plugin;
		const filename = `${Date.now()} with spaces.css`;

		await createSnippetFile(app, filename);
		await expect(checkSnippetExists(app, filename)).to.eventually.be.true;

		// cleanup
		await deleteSnippetFile(app, filename);
		await expect(checkSnippetExists(app, filename)).to.eventually.be.false;
	});
}
