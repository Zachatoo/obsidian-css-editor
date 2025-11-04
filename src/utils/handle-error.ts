import { Notice } from "obsidian";

export function handleError(
	err: unknown,
	fallbackMessage: string = "Action failed. Reason unknown.",
) {
	let message = fallbackMessage;
	if (err instanceof Error) {
		message = err.message;
	}
	new Notice(message);
	console.error(`[CSS Editor]: ${message}`);
	console.error(err);
}
