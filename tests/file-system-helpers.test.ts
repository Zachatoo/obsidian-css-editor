import { expect } from "chai";
import {
	checkSnippetExists,
	createSnippetFile,
	deleteSnippetFile,
	readSnippetFile,
	writeSnippetFile,
} from "src/obsidian/file-system-helpers";
import TestCssEditorPlugin from "./main.test";

export async function fileSystemHelpersTests(testPlugin: TestCssEditorPlugin) {
	await testPlugin.test("create/read/update/delete should work", async () => {
		const { app } = testPlugin.plugin;
		const filename = `${Date.now()}crud.css`;
		const mockContent = "this is a test";
		const mockContent2 = "this is a test two";

		const file = await createSnippetFile(app, filename);
		await expect(checkSnippetExists(app, filename)).to.eventually.be.true;

		await writeSnippetFile(app, file, mockContent);
		await expect(readSnippetFile(app, file)).to.eventually.equal(
			mockContent
		);

		await writeSnippetFile(app, file, mockContent2);
		await expect(readSnippetFile(app, file)).to.eventually.equal(
			mockContent2
		);

		await deleteSnippetFile(app, file);
		await expect(checkSnippetExists(app, filename)).to.eventually.be.false;
	});

	await testPlugin.test(
		"create snippet that already exists should fail",
		async () => {
			const { app } = testPlugin.plugin;
			const filename = `${Date.now()}already-exists.css`;

			const file = await createSnippetFile(app, filename);
			await expect(checkSnippetExists(app, filename)).to.eventually.be
				.true;

			await expect(createSnippetFile(app, filename)).to.be.rejectedWith();

			// cleanup
			await deleteSnippetFile(app, file);
			await expect(checkSnippetExists(app, filename)).to.eventually.be
				.false;
		}
	);

	await testPlugin.test(
		"create snippet that is not .css file should fail",
		async () => {
			const { app } = testPlugin.plugin;
			const filename = `${Date.now()}not-css.txt`;

			await expect(createSnippetFile(app, filename)).to.be.rejectedWith();
			await expect(checkSnippetExists(app, filename)).to.eventually.be
				.false;
		}
	);

	await testPlugin.test(
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

	await testPlugin.test(
		"create snippet with spaces should succeed",
		async () => {
			const { app } = testPlugin.plugin;
			const filename = `${Date.now()} with spaces.css`;

			const file = await createSnippetFile(app, filename);
			await expect(checkSnippetExists(app, filename)).to.eventually.be
				.true;

			// cleanup
			await deleteSnippetFile(app, file);
			await expect(checkSnippetExists(app, filename)).to.eventually.be
				.false;
		}
	);

	await testPlugin.test(
		"create snippet without .css extension should add it",
		async () => {
			const { app } = testPlugin.plugin;
			const filename = `${Date.now()}without-extension`;
			const filenameWithExtension = `${filename}.css`;

			const file = await createSnippetFile(app, filename);
			await expect(checkSnippetExists(app, filenameWithExtension)).to
				.eventually.be.true;

			// cleanup
			await deleteSnippetFile(app, file);
			await expect(checkSnippetExists(app, filenameWithExtension)).to
				.eventually.be.false;
		}
	);
}
