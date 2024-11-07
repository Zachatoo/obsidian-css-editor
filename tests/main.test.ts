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

	async onload() {
		this.addCommand({
			id: "test-css-editor-plugin",
			name: "Run CSS Editor Tests",
			callback: async () => {
				await this.loadPlugin();
				this.runTests();
			},
		});
	}

	async loadPlugin() {
		const plugin = this.app.plugins.getPlugin(PLUGIN_ID);
		if (!plugin) {
			throw new Error(`${PLUGIN_ID} plugin not found`);
		}
		this.plugin = plugin as CssEditorPlugin;
	}

	runTests() {
		cssFileTests(this);
		fileSystemHelpersTests(this);
	}

	async test(name: string, cb: () => Promise<void>) {
		try {
			await cb();
			console.log(`PASS: ${name}`);
		} catch (err) {
			console.error(`FAIL: ${name}\n${err}`);
		}
	}
}
