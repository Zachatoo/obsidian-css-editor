export class CssFile {
	/** Full name of file. */
	name: string;
	/** Name without extension. */
	basename: string;
	/** File extension. */
	extension = "css";

	constructor(name: string) {
		if (typeof name !== "string" || name.length === 0) {
			throw new Error("Invalid file name.");
		}
		const extensionWithDot = `.${this.extension}`;
		const basename = name.endsWith(extensionWithDot)
			? name.slice(0, name.length - extensionWithDot.length)
			: name;

		this.name = `${basename}.${this.extension}`;
		this.basename = basename;
	}
}
