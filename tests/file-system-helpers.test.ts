import { expect } from "chai";
import {
	checkSnippetExists,
	createSnippetFile,
	deleteSnippetFile,
	readSnippetFile,
	writeSnippetFile,
} from "src/obsidian/file-system-helpers";
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
			const filename2 = `${Date.now()}with-trailing-dots...css`;

			await expect(createSnippetFile(app, filename)).to.be.rejectedWith();
			await expect(checkSnippetExists(app, filename)).to.eventually.be
				.false;

			await expect(
				createSnippetFile(app, filename2)
			).to.be.rejectedWith();
			await expect(checkSnippetExists(app, filename2)).to.eventually.be
				.false;
		}
	);

	testPlugin.test("create snippet with spaces should succeed", async () => {
		const { app } = testPlugin.plugin;
		const filename1 = `${Date.now()} with spaces.css`;

		await createSnippetFile(app, filename1);
		await expect(checkSnippetExists(app, filename1)).to.eventually.be.true;

		// cleanup
		await deleteSnippetFile(app, filename1);
		await expect(checkSnippetExists(app, filename1)).to.eventually.be.false;
	});

	testPlugin.test(
		"create snippet without .css extension should add it",
		async () => {
			const { app } = testPlugin.plugin;
			const filename = `${Date.now()}without-extension`;
			const filenameWithExtension = `${filename}.css`;

			await createSnippetFile(app, filename);
			await expect(checkSnippetExists(app, filenameWithExtension)).to
				.eventually.be.true;

			// cleanup
			await deleteSnippetFile(app, filenameWithExtension);
			await expect(checkSnippetExists(app, filenameWithExtension)).to
				.eventually.be.false;
		}
	);
}
