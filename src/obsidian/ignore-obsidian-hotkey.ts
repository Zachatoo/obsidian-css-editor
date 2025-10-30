import type { Command, KeymapInfo, Scope } from "obsidian";
import { around } from "monkey-around";

/**
 * @param keymapInfo Hotkey to conditionally ignore.
 * @param checkCallback Callback function that determines whether this hotkey should be executed at the moment.
 */
export function ignoreObsidianHotkey(
	scope: Scope,
	keymapInfo: KeymapInfo,
	checkCallback: () => boolean
) {
	const uninstallCommand = around(scope, {
		handleKey(originalMethod) {
			return function (...args: Command[]) {
				const invokedHotkey = args[1];
				if (
					isKeymapInfo(invokedHotkey) &&
					keymapInfo.key === invokedHotkey.key &&
					keymapInfo.modifiers === invokedHotkey.modifiers &&
					checkCallback()
				) {
					return true;
				}
				const result =
					originalMethod && originalMethod.apply(this, args);
				return result;
			};
		},
	});
	return uninstallCommand;
}

function isKeymapInfo(hotkey: unknown): hotkey is KeymapInfo {
	return (
		!!hotkey &&
		typeof hotkey === "object" &&
		"key" in hotkey &&
		typeof hotkey.key === "string" &&
		"modifiers" in hotkey
	);
}
