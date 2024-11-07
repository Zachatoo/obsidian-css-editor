import { expect } from "chai";
import { CssFile } from "../src/CssFile";
import TestCssEditorPlugin from "./main.test";

export async function cssFileTests(testPlugin: TestCssEditorPlugin) {
	testPlugin.test(
		"should create a CssFile instance with valid name",
		async () => {
			const now = Date.now();
			const cssFile = new CssFile(`${now}test.css`);
			expect(cssFile.name).to.equal(`${now}test.css`);
			expect(cssFile.basename).to.equal(`${now}test`);
			expect(cssFile.extension).to.equal("css");
		}
	);

	testPlugin.test("should add .css extension if not provided", async () => {
		const now = Date.now();
		const cssFile = new CssFile(`${now}test`);
		expect(cssFile.name).to.equal(`${now}test.css`);
		expect(cssFile.basename).to.equal(`${now}test`);
		expect(cssFile.extension).to.equal("css");
	});

	testPlugin.test("should throw an error for invalid file name", async () => {
		expect(() => new CssFile("")).to.throw("Invalid file name.");
		expect(() => new CssFile(123 as never)).to.throw("Invalid file name.");
		expect(() => new CssFile(null as never)).to.throw("Invalid file name.");
		expect(() => new CssFile(undefined as never)).to.throw(
			"Invalid file name."
		);
	});

	testPlugin.test(
		"should handle names with multiple dots correctly",
		async () => {
			const now = Date.now();
			const cssFile = new CssFile(`${now}my.file.name.css`);
			expect(cssFile.name).to.equal(`${now}my.file.name.css`);
			expect(cssFile.basename).to.equal(`${now}my.file.name`);
		}
	);

	testPlugin.test("should handle names with spaces correctly", async () => {
		const now = Date.now();
		const cssFile = new CssFile(`${now}file with spaces.css`);
		expect(cssFile.name).to.equal(`${now}file with spaces.css`);
		expect(cssFile.basename).to.equal(`${now}file with spaces`);
	});

	testPlugin.test(
		"should handle names with trailing dots correctly",
		async () => {
			const now = Date.now();
			const cssFile = new CssFile(`${now}file with trailing dots....css`);
			expect(cssFile.name).to.equal(
				`${now}file with trailing dots....css`
			);
			expect(cssFile.basename).to.equal(
				`${now}file with trailing dots...`
			);
		}
	);

	testPlugin.test(
		"should handle names with single trailing dot correctly",
		async () => {
			const now = Date.now();
			const cssFile = new CssFile(`${now}file with trailing dot.`);
			expect(cssFile.name).to.equal(`${now}file with trailing dot..css`);
			expect(cssFile.basename).to.equal(`${now}file with trailing dot.`);
		}
	);
}
