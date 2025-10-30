import { Plugin } from "obsidian";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import CssEditorPlugin from "src/main";
import { fileSystemHelpersTests } from "./file-system-helpers.test";
import { cssFileTests } from "./CssFile.test";

chai.use(chaiAsPromised);

const PLUGIN_ID = "css-editor";

export default class TestCssEditorPlugin extends Plugin {
	plugin: CssEditorPlugin;

	onload() {
		this.addCommand({
			id: "test",
			name: "Run tests",
			callback: async () => {
				this.loadPlugin();
				await this.runTests();
			},
		});
	}

	loadPlugin() {
		const plugin = this.app.plugins.getPlugin(PLUGIN_ID);
		if (!plugin) {
			throw new Error(`${PLUGIN_ID} plugin not found`);
		}
		this.plugin = plugin as CssEditorPlugin;
	}

	async runTests() {
		await cssFileTests(this);
		await fileSystemHelpersTests(this);
	}

	async test(name: string, cb: () => Promise<void> | void) {
		try {
			await cb();
			console.debug(`PASS: ${name}`);
		} catch (err) {
			console.error(`FAIL: ${name}\n${String(err)}`);
		}
	}
}
