import Color from "color";
import { EditorState } from "@codemirror/state";
import { syntaxTree } from "@codemirror/language";
import { inlineCssLanguage } from "src/codemirror-extensions/inline-css";

interface ColorMatch {
	from: number;
	to: number;
	color: string;
}

export function findColorValues(state: EditorState): ColorMatch[] {
	const matches: ColorMatch[] = [];
	const tree = syntaxTree(state);
	const doc = state.doc;

	tree.cursor().iterate((nodeRef) => {
		const { node } = nodeRef;
		const nodeText = doc.sliceString(node.from, node.to);

		if (isColorValue(node.name, nodeText)) {
			matches.push({
				from: node.from,
				to: node.to,
				color: nodeText,
			});
		} else if (node.name === "Comment") {
			const commentMatches = findColorsInComment(nodeText, node.from);
			matches.push(...commentMatches);
		}
	});

	return matches.sort((a, b) => a.from - b.from);
}

export function convertToColorModel(color: string, model: string): string {
	switch (model) {
		case "rgb":
			return convertToRgb(color);
		case "hsl":
			return convertToHsl(color);
		case "hex":
			return convertToHex(color);
		default:
			return color;
	}
}

export function getColorModel(color: string): string {
	try {
		if (color.startsWith("#")) return "hex";
		if (isValidColorName(color)) return "hex";
		return Color(color).toJSON().model;
	} catch {
		return "hex";
	}
}

export function convertToHex(color: string): string {
	try {
		return Color(color).hex().toLowerCase();
	} catch {
		return color;
	}
}

function convertToRgb(color: string): string {
	try {
		return Color(color).rgb().toString();
	} catch {
		return color;
	}
}

function convertToHsl(color: string): string {
	try {
		return Color(color).hsl().round().toString();
	} catch {
		return color;
	}
}

function isColorValue(nodeName: string, nodeText: string): boolean {
	switch (nodeName) {
		case "ColorLiteral":
			// For hex colors like #ffffff
			return true;

		case "ValueName":
			// For named colors like 'red', 'blue', etc.
			return isValidColorName(nodeText);

		case "CallExpression":
			// For function calls like rgb(), hsl(), etc.
			return /^(rgb|rgba|hsl|hsla|hwb)\s*\(/.test(nodeText);

		default:
			return false;
	}
}

const validColorNames = new Set([
	"aliceblue",
	"antiquewhite",
	"aqua",
	"aquamarine",
	"azure",
	"beige",
	"bisque",
	"black",
	"blanchedalmond",
	"blue",
	"blueviolet",
	"brown",
	"burlywood",
	"cadetblue",
	"chartreuse",
	"chocolate",
	"coral",
	"cornflowerblue",
	"cornsilk",
	"crimson",
	"cyan",
	"darkblue",
	"darkcyan",
	"darkgoldenrod",
	"darkgray",
	"darkgreen",
	"darkgrey",
	"darkkhaki",
	"darkmagenta",
	"darkolivegreen",
	"darkorange",
	"darkorchid",
	"darkred",
	"darksalmon",
	"darkseagreen",
	"darkslateblue",
	"darkslategray",
	"darkslategrey",
	"darkturquoise",
	"darkviolet",
	"deeppink",
	"deepskyblue",
	"dimgray",
	"dimgrey",
	"dodgerblue",
	"firebrick",
	"floralwhite",
	"forestgreen",
	"fuchsia",
	"gainsboro",
	"ghostwhite",
	"gold",
	"goldenrod",
	"gray",
	"green",
	"greenyellow",
	"grey",
	"honeydew",
	"hotpink",
	"indianred",
	"indigo",
	"ivory",
	"khaki",
	"lavender",
	"lavenderblush",
	"lawngreen",
	"lemonchiffon",
	"lightblue",
	"lightcoral",
	"lightcyan",
	"lightgoldenrodyellow",
	"lightgray",
	"lightgreen",
	"lightgrey",
	"lightpink",
	"lightsalmon",
	"lightseagreen",
	"lightskyblue",
	"lightslategray",
	"lightslategrey",
	"lightsteelblue",
	"lightyellow",
	"lime",
	"limegreen",
	"linen",
	"magenta",
	"maroon",
	"mediumaquamarine",
	"mediumblue",
	"mediumorchid",
	"mediumpurple",
	"mediumseagreen",
	"mediumslateblue",
	"mediumspringgreen",
	"mediumturquoise",
	"mediumvioletred",
	"midnightblue",
	"mintcream",
	"mistyrose",
	"moccasin",
	"navajowhite",
	"navy",
	"oldlace",
	"olive",
	"olivedrab",
	"orange",
	"orangered",
	"orchid",
	"palegoldenrod",
	"palegreen",
	"paleturquoise",
	"palevioletred",
	"papayawhip",
	"peachpuff",
	"peru",
	"pink",
	"plum",
	"powderblue",
	"purple",
	"rebeccapurple",
	"red",
	"rosybrown",
	"royalblue",
	"saddlebrown",
	"salmon",
	"sandybrown",
	"seagreen",
	"seashell",
	"sienna",
	"silver",
	"skyblue",
	"slateblue",
	"slategray",
	"slategrey",
	"snow",
	"springgreen",
	"steelblue",
	"tan",
	"teal",
	"thistle",
	"tomato",
	"turquoise",
	"violet",
	"wheat",
	"white",
	"whitesmoke",
	"yellow",
	"yellowgreen",
]);

function isValidColorName(name: string): boolean {
	return validColorNames.has(name.toLowerCase());
}

function findColorsInComment(
	commentText: string,
	commentStart: number
): ColorMatch[] {
	const matches: ColorMatch[] = [];

	// Find the actual content by removing comment delimiters
	const withoutDelimiters = commentText.replace(/^\/\*|\*\/$/g, "");
	const content = withoutDelimiters.trim();

	if (!content) {
		return matches;
	}

	// Calculate the offset caused by removing /* and any leading whitespace
	const leadingWhitespaceMatch = withoutDelimiters.match(/^(\s*)/);
	const leadingWhitespaceLength = leadingWhitespaceMatch
		? leadingWhitespaceMatch[1]?.length ?? 0
		: 0;
	const totalOffset = 2 + leadingWhitespaceLength; // 2 for "/*" + leading whitespace

	try {
		const commentState = EditorState.create({
			doc: content,
			extensions: [inlineCssLanguage],
		});

		const commentTree = syntaxTree(commentState);
		const commentDoc = commentState.doc;

		commentTree.cursor().iterate((nodeRef) => {
			const { node } = nodeRef;
			const nodeText = commentDoc.sliceString(node.from, node.to);

			if (isColorValue(node.name, nodeText)) {
				// Calculate the absolute position within the original document
				const absoluteStart = commentStart + node.from + totalOffset;
				const absoluteEnd = commentStart + node.to + totalOffset;

				matches.push({
					from: absoluteStart,
					to: absoluteEnd,
					color: nodeText,
				});
			}
		});
	} catch (error) {
		console.warn(
			"Failed to parse comment as CSS, skipping color detection:",
			error
		);
	}

	return matches;
}
