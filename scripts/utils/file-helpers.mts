import { readFile, writeFile, rm } from "fs/promises";
import * as path from "path";

export async function replaceInFile(
	relativePath: string,
	searchValue: RegExp,
	replaceValue: string
) {
	const filePath = path.join(process.cwd(), relativePath);
	let contents = await readFile(filePath, "utf-8");
	contents = contents.replace(searchValue, replaceValue);
	await writeFile(filePath, contents, { encoding: "utf-8" });
}

export async function readJsonFile(relativePath: string): Promise<unknown> {
	return JSON.parse(
		await readFile(path.join(process.cwd(), relativePath), "utf-8")
	);
}

export async function writeJsonFile(relativePath: string, data: object) {
	await writeFile(
		path.join(process.cwd(), relativePath),
		JSON.stringify(data, null, "\t") + "\n",
		"utf-8"
	);
}

export async function removeFile(relativePath: string) {
	await rm(path.join(process.cwd(), relativePath));
}
