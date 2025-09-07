import { indentUnit } from "@codemirror/language";
import { TransactionSpec } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { App, PluginSettingTab, Setting } from "obsidian";
import { indentSize, lineWrap } from "src/codemirror-extensions/compartments";
import CssEditorPlugin from "src/main";
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

	constructor(app: App, plugin: CssEditorPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		this.containerEl.empty();

		new Setting(this.containerEl)
			.setName("Confirm CSS snippet deletion")
			.setDesc("Prompt before CSS snippet deletion.")
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.promptDelete);
				toggle.onChange((val) => {
					this.plugin.settings.promptDelete = val;
					this.plugin.saveSettings();
				});
			});

		new Setting(this.containerEl)
			.setName("Line wrap")
			.setDesc("Toggle line wrap in the editor.")
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.lineWrap);
				toggle.onChange((val) => {
					this.plugin.settings.lineWrap = val;
					this.plugin.saveSettings();
					updateCSSEditorView(this.app, {
						effects: lineWrap.reconfigure(
							val ? EditorView.lineWrapping : []
						),
					});
				});
			});

		new Setting(this.containerEl)
			.setName("Indent size")
			.setDesc("Adjust the amount of spaces used for indentation.")
			.addText((field) => {
				field.setPlaceholder("2");
				field.setValue(this.plugin.settings.indentSize.toString());
				field.onChange((val) => {
					val = val.replace(/\D/g, "");
					field.setValue(val);
					const size = parseInt(val);
					this.plugin.settings.indentSize = size;
					this.plugin.saveSettings();
					updateCSSEditorView(this.app, {
						effects: indentSize.reconfigure(
							indentUnit.of("".padEnd(size))
						),
					});
				});
			});
	}
}
