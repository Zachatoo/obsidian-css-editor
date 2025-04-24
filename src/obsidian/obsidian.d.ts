/* eslint-disable no-mixed-spaces-and-tabs */
import "obsidian";
import { CssFile } from "src/CssFile";

declare module "obsidian" {
	interface App {
		customCss:
			| {
					snippets: string[] | undefined;
					setCssEnabledStatus:
						| ((name: string, value: boolean) => void)
						| undefined;
					enabledSnippets: Set<string> | undefined;
			  }
			| undefined;
		plugins: {
			getPlugin: (pluginID: string) => Plugin | null;
		};
	}
	interface Vault {
		getConfig?: (key: string) => unknown;
	}

	interface FuzzySuggestModal<T> {
		chooser?: {
			useSelectedItem?: (evt: KeyboardEvent) => boolean;
			selectedItem: number;
			values: {
				item: T;
				match: {
					score: number;
					matches: string[];
				};
			}[];
			setSuggestions?: (suggestions: FuzzyMatch<T>[]) => void;
			suggestions: HTMLElement[];
			addMessage?: (text: string) => HTMLDivElement;
		};
	}

	interface Workspace {
		on(
			name: "css-editor-change",
			callback: (file: CssFile, data: string) => void
		): EventRef;
		on(
			name: "css-snippet-rename",
			callback: (file: CssFile, oldFileName: string) => void
		): EventRef;
	}

	interface ItemView {
		/**
		 * The HTML element representing the title in the tab title bar.
		 */
		titleEl: HTMLElement;
	}

	interface WorkspaceLeaf {
		/**
		 * Update the header of the leaf with a new title, based on the results of `getDisplayText`.
		 */
		updateHeader(): void;
	}
}
