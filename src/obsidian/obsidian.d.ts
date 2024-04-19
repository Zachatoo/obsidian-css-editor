/* eslint-disable no-mixed-spaces-and-tabs */
import "obsidian";

declare module "obsidian" {
	interface App {
		customCss:
			| {
					snippets: string[] | undefined;
					setCssEnabledStatus:
						| ((name: string, value: boolean) => void)
						| undefined;
					enabledSnippets: Set<String> | undefined;
			  }
			| undefined;
		plugins: {
			getPlugin: (pluginID: string) => Plugin_2 | null;
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
				item: String,
				match: {
					score: number,
					matches: string[]
				}
			}[];
			setSuggestions?: (suggestions: FuzzyMatch<T>[]) => void;
			suggestions: HTMLElement[];
			addMessage?: (text: string) => HTMLDivElement;
		};
	}
}
