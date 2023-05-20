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
}
