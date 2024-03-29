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
			  }
			| undefined;
		plugins: {
			getPlugin: (pluginID: string) => Plugin_2 | null;
		};
	}
	interface Vault {
		getConfig?: (key: string) => unknown;
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	interface FuzzySuggestModal<T> {
		chooser?: {
			useSelectedItem?: (evt: KeyboardEvent) => boolean;
		};
	}
}
