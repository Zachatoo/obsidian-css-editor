export interface CssEditorPluginSettings {
	promptDelete: boolean;
	lineWrap: boolean;
	indentSize: number;
	relativeLineNumbers: boolean;
}

export const DEFAULT_SETTINGS: CssEditorPluginSettings = {
	promptDelete: true,
	lineWrap: true,
	indentSize: 2,
	relativeLineNumbers: false,
};
