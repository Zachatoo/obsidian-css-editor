import { indentUnit } from "@codemirror/language";
import { TransactionSpec } from "@codemirror/state";
import { EditorView, lineNumbers } from "@codemirror/view";
import { App, PluginSettingTab, SettingDefinitionItem } from "obsidian";
import { indentSize, lineWrap } from "src/codemirror-extensions/compartments";
import {
	relativeLineNumberGutter,
	relativeLineNumbersFormatter,
	absoluteLineNumbers,
} from "src/codemirror-extensions/relative-line-numbers";
import CssEditorPlugin from "src/main";
import { CssEditorPluginSettings } from "./settings";
import { CssEditorView, VIEW_TYPE_CSS } from "src/views/CssEditorView";

function updateCSSEditorView(app: App, spec: TransactionSpec) {
	app.workspace.getLeavesOfType(VIEW_TYPE_CSS).forEach((leaf) => {
		if (leaf.view instanceof CssEditorView) {
			leaf.view.dispatchEditorTransaction(spec);
		}
	});
}

export class CSSEditorSettingTab extends PluginSettingTab {
	plugin: CssEditorPlugin;
	icon = "css-editor-logo";

	constructor(app: App, plugin: CssEditorPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	getSettingDefinitions(): SettingDefinitionItem<
		keyof CssEditorPluginSettings
	>[] {
		return [
			{
				type: "group",
				items: [
					{
						name: "Line wrap",
						desc: "Toggle line wrap in the editor.",
						control: { type: "toggle", key: "lineWrap" },
					},
					{
						name: "Indent size",
						desc: "Adjust the amount of spaces used for indentation.",
						control: {
							type: "slider",
							key: "indentSize",
							min: 1,
							max: 8,
							step: 1,
						},
					},
					{
						name: "Relative line numbers",
						desc: "Show line numbers relative to cursor position.",
						control: { type: "toggle", key: "relativeLineNumbers" },
					},
				],
			},
			{
				type: "group",
				heading: "Trash",
				items: [
					{
						name: "Confirm before deleting files",
						desc: "Avoid accidentally deleting files.",
						control: { type: "toggle", key: "promptDelete" },
					},
				],
			},
		];
	}

	/**
	 * Persist the value, then apply it to any open CSS editors.
	 */
	async setControlValue(key: string, value: unknown): Promise<void> {
		await super.setControlValue(key, value);
		if (key === "lineWrap") {
			this.#applyLineWrap(value as boolean);
		} else if (key === "indentSize") {
			this.#applyIndentSize(value as number);
		} else if (key === "relativeLineNumbers") {
			this.#applyRelativeLineNumbers(value as boolean);
		}
	}

	#applyLineWrap(val: boolean): void {
		updateCSSEditorView(this.app, {
			effects: lineWrap.reconfigure(val ? EditorView.lineWrapping : []),
		});
	}

	#applyIndentSize(val: number): void {
		updateCSSEditorView(this.app, {
			effects: indentSize.reconfigure(indentUnit.of("".padEnd(val))),
		});
	}

	#applyRelativeLineNumbers(val: boolean): void {
		updateCSSEditorView(this.app, {
			effects: relativeLineNumberGutter.reconfigure(
				lineNumbers({
					formatNumber: val
						? relativeLineNumbersFormatter
						: absoluteLineNumbers,
				}),
			),
		});
	}
}
