import * as process from "process";

export function prompt(question: string) {
	return new Promise((resolve, reject) => {
		process.stdin.resume();
		process.stdout.write(question);

		process.stdin.on("data", (data) => resolve(data.toString().trim()));
		process.stdin.on("error", (err) => reject(err));
	});
}
