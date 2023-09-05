import { Notice } from "obsidian";

const DEFAULT_NOTICE_TIMEOUT_SECONDS = 5;

export class InfoNotice extends Notice {
	constructor(
		message: string | DocumentFragment,
		timeout = DEFAULT_NOTICE_TIMEOUT_SECONDS
	) {
		super(message, timeout * 1000);
		console.info(`css-editor: ${message}`);
	}
}

export class ErrorNotice extends Notice {
	constructor(
		message: string | DocumentFragment,
		timeout = DEFAULT_NOTICE_TIMEOUT_SECONDS
	) {
		super(message, timeout * 1000);
		console.error(`css-editor: ${message}`);
	}
}
