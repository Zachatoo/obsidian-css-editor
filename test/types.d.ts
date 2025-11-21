import type CssEditorPlugin from "../src/main.js";
declare module "wdio-obsidian-service" {
	interface InstalledPlugins {
		cssEditor: CssEditorPlugin;
	}
}
