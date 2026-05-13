import { defineConfig, globalIgnores } from "eslint/config";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";
import obsidianmd from "eslint-plugin-obsidianmd";
import { configs as wdioConfigs } from "eslint-plugin-wdio";

const obsidianGlobals = {
	createEl: "readonly",
	createDiv: "readonly",
	createSpan: "readonly",
	createSvg: "readonly",
	createFragment: "readonly",
	activeDocument: "readonly",
	activeWindow: "readonly",
};

export default defineConfig([
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...obsidianGlobals,
				...globals.mocha,
				WebdriverIO: "readonly",
			},
			parserOptions: {
				projectService: {
					allowDefaultProject: [
						"eslint.config.mjs",
						"manifest.json",
						"package.json",
						"tsconfig.json",
					],
				},
				tsconfigRootDir: import.meta.dirname,
				extraFileExtensions: [".json"],
			},
		},
	},
	...obsidianmd.configs.recommended,
	{
		files: ["**/*.json"],
		rules: {
			"obsidianmd/no-plugin-as-component": "off",
			"@typescript-eslint/no-unused-expressions": "off",
		},
	},
	wdioConfigs["flat/recommended"],
	globalIgnores([
		"node_modules",
		"dist",
		".obsidian-cache",
		".vscode",
		"esbuild.config.mjs",
		"version-bump.mjs",
		"versions.json",
		"main.js",
		"package-lock.json",
		"data.json",
		"test/vault",
	]),
]);
