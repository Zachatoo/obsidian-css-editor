import { indentUnit } from "@codemirror/language";
import { TransactionSpec } from "@codemirror/state";
import { EditorView, lineNumbers } from "@codemirror/view";
import { App, PluginSettingTab, SettingGroup } from "obsidian";
import { indentSize, lineWrap } from "src/codemirror-extensions/compartments";
import {
	relativeLineNumberGutter,
	relativeLineNumbersFormatter,
	absoluteLineNumbers,
} from "src/codemirror-extensions/relative-line-numbers";
import CssEditorPlugin from "src/main";
import { DEFAULT_SETTINGS } from "./settings";
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

	display(): void {
		this.containerEl.empty();

		const editorGroup = new SettingGroup(this.containerEl);

		editorGroup.addSetting((setting) => {
			setting
				.setName("Line wrap")
				.setDesc("Toggle line wrap in the editor.")
				.addToggle((toggle) => {
					toggle.setValue(this.plugin.settings.lineWrap);
					toggle.onChange(async (val) => {
						this.plugin.settings.lineWrap = val;
						await this.plugin.saveSettings();
						updateCSSEditorView(this.app, {
							effects: lineWrap.reconfigure(
								val ? EditorView.lineWrapping : [],
							),
						});
					});
				});
		});

		editorGroup.addSetting((setting) => {
			setting
				.setName("Indent size")
				.setDesc("Adjust the amount of spaces used for indentation.")
				.addExtraButton((btn) => {
					btn.setIcon("reset")
						.setTooltip("Restore default")
						.onClick(async () => {
							this.plugin.settings.indentSize =
								DEFAULT_SETTINGS.indentSize;
							await this.plugin.saveSettings();
							updateCSSEditorView(this.app, {
								effects: indentSize.reconfigure(
									indentUnit.of("".padEnd(2)),
								),
							});
							this.display();
						});
				})
				.addSlider((slider) => {
					slider
						.setLimits(1, 8, 1)
						.setValue(this.plugin.settings.indentSize)
						.setDynamicTooltip()
						.onChange(async (val) => {
							this.plugin.settings.indentSize = val;
							await this.plugin.saveSettings();
							updateCSSEditorView(this.app, {
								effects: indentSize.reconfigure(
									indentUnit.of("".padEnd(val)),
								),
							});
						});
				});
		});

		editorGroup.addSetting((setting) => {
			setting
				.setName("Relative line numbers")
				.setDesc("Show line numbers relative to cursor position.")
				.addToggle((toggle) => {
					toggle.setValue(this.plugin.settings.relativeLineNumbers);
					toggle.onChange(async (val) => {
						this.plugin.settings.relativeLineNumbers = val;
						await this.plugin.saveSettings();
						updateCSSEditorView(this.app, {
							effects: relativeLineNumberGutter.reconfigure(
								lineNumbers({
									formatNumber: val
										? relativeLineNumbersFormatter
										: absoluteLineNumbers,
								}),
							),
						});
					});
				});
		});

		const trashGroup = new SettingGroup(this.containerEl).setHeading(
			"Trash",
		);

		trashGroup.addSetting((setting) => {
			setting
				.setName("Confirm file deletion")
				.setDesc("Ask before deleting a file.")
				.addToggle((toggle) => {
					toggle.setValue(this.plugin.settings.promptDelete);
					toggle.onChange(async (val) => {
						this.plugin.settings.promptDelete = val;
						await this.plugin.saveSettings();
					});
				});
		});
	}
}
