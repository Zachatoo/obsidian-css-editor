import { indentUnit } from "@codemirror/language";
import { TransactionSpec } from "@codemirror/state";
import { EditorView, lineNumbers } from "@codemirror/view";
import {
	App,
	PluginSettingTab,
	requireApiVersion,
	Setting,
	SettingDefinition,
	SettingDefinitionGroup,
	SettingDefinitionItem,
	SettingGroup,
} from "obsidian";
import { indentSize, lineWrap } from "src/codemirror-extensions/compartments";
import {
	relativeLineNumberGutter,
	relativeLineNumbersFormatter,
	absoluteLineNumbers,
} from "src/codemirror-extensions/relative-line-numbers";
import CssEditorPlugin from "src/main";
import { CssEditorPluginSettings, DEFAULT_SETTINGS } from "./settings";
import { CssEditorView, VIEW_TYPE_CSS } from "src/views/CssEditorView";

function updateCSSEditorView(app: App, spec: TransactionSpec) {
	app.workspace.getLeavesOfType(VIEW_TYPE_CSS).forEach((leaf) => {
		if (leaf.view instanceof CssEditorView) {
			leaf.view.dispatchEditorTransaction(spec);
		}
	});
}

export class CSSEditorSettingTab extends PluginSettingTab<CssEditorPluginSettings> {
	plugin: CssEditorPlugin;
	icon = "css-editor-logo";

	constructor(
		app: App,
		plugin: CssEditorPlugin,
		settings: CssEditorPluginSettings,
	) {
		super(app, plugin, settings);
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
						render: (setting: Setting) => {
							setting.addToggle((toggle) => {
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
						},
					},
					{
						name: "Indent size",
						desc: "Adjust the amount of spaces used for indentation.",
						render: (setting: Setting) => {
							setting
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
											if (requireApiVersion("1.13.0")) {
												this.update();
											} else {
												// eslint-disable-next-line @typescript-eslint/no-deprecated -- remove when minAppVersion is 1.13.0 or higher
												this.display();
											}
										});
								})
								.addSlider((slider) => {
									slider
										.setLimits(1, 8, 1)
										.setValue(
											this.plugin.settings.indentSize,
										)
										.setDynamicTooltip()
										.onChange(async (val) => {
											this.plugin.settings.indentSize =
												val;
											await this.plugin.saveSettings();
											updateCSSEditorView(this.app, {
												effects: indentSize.reconfigure(
													indentUnit.of(
														"".padEnd(val),
													),
												),
											});
										});
								});
						},
					},
					{
						name: "Relative line numbers",
						desc: "Show line numbers relative to cursor position.",
						render: (setting: Setting) => {
							setting.addToggle((toggle) => {
								toggle.setValue(
									this.plugin.settings.relativeLineNumbers,
								);
								toggle.onChange(async (val) => {
									this.plugin.settings.relativeLineNumbers =
										val;
									await this.plugin.saveSettings();
									updateCSSEditorView(this.app, {
										effects:
											relativeLineNumberGutter.reconfigure(
												lineNumbers({
													formatNumber: val
														? relativeLineNumbersFormatter
														: absoluteLineNumbers,
												}),
											),
									});
								});
							});
						},
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
						render: (setting: Setting) => {
							setting.addToggle((toggle) => {
								toggle.setValue(
									this.plugin.settings.promptDelete,
								);
								toggle.onChange(async (val) => {
									this.plugin.settings.promptDelete = val;
									await this.plugin.saveSettings();
								});
							});
						},
					},
				],
			},
		];
	}

	/**
	 * Keeping around for backwards compatibility, remove when minAppVersion is 1.13.0 or higher.
	 * Only supports rendering settings that are of type "group" and have a render function.
	 */
	display(): void {
		this.containerEl.empty();

		const settingDefinitions = this.getSettingDefinitions();

		settingDefinitions.forEach((def) => {
			if ("type" in def && def.type === "group") {
				this.#renderGroup(def);
				return;
			}
		});
	}

	#renderGroup(
		groupDef: SettingDefinitionGroup<keyof CssEditorPluginSettings>,
	): void {
		const group = new SettingGroup(this.containerEl);
		if (groupDef.heading) {
			group.setHeading(groupDef.heading);
		}
		if (
			"items" in groupDef &&
			Array.isArray(groupDef.items) &&
			groupDef.items.length > 0
		) {
			groupDef.items.forEach((itemDef) => {
				this.#renderSetting(itemDef, group);
			});
		}
	}

	#renderSetting(
		settingDef: SettingDefinition<keyof CssEditorPluginSettings>,
		group: SettingGroup,
	): void {
		if ("render" in settingDef && typeof settingDef.render === "function") {
			group.addSetting((setting) => {
				if (settingDef.name) {
					setting.setName(settingDef.name);
				}
				if (settingDef.desc) {
					setting.setDesc(settingDef.desc);
				}
				settingDef.render(setting, group);
			});
		}
	}
}
