export function dashCaseToPascalCase(value: string) {
	return value
		.split("-")
		.map((x) => `${x.charAt(0).toUpperCase()}${x.slice(1)}`)
		.join("");
}

export function dashCaseToTitleCase(value: string) {
	return value
		.split("-")
		.map((x) => `${x.charAt(0).toUpperCase()}${x.slice(1)}`)
		.join(" ");
}
