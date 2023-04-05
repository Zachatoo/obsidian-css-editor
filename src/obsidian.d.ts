/* eslint-disable no-mixed-spaces-and-tabs */
import "obsidian";

declare module "obsidian" {
	interface App {
		customCss:
			| {
					snippets: string[] | null | undefined;
			  }
			| null
			| undefined;
	}
}
