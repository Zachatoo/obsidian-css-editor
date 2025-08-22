import Color from "color";

interface ColorMatch {
	from: number;
	to: number;
	color: string;
}

const num = String.raw`\d*(?:\.\d*)?`;
const percent = `(?:${num}%|0)`;
const numOrPercent = `${num}%?`;
const alpha = numOrPercent;
const hue = `${num}(?:deg|grad|rad|turn)?`;

const hexColorRegexes = [
	// Hex colors: #000, #0000, #000000, #00000000
	`#(?:[0-9a-fA-F]{3}){1,2}`,
	`#(?:[0-9a-fA-F]{4}){1,2}`,
];
const rgbColorRegexes = [
	// Legacy rgb/rgba: rgba(1,2,3,0.5)
	String.raw`rgba?\(\s*${num}\s*,\s*${num}\s*,\s*${num}\s*(?:,\s*${alpha}\s*)?\)`,
	String.raw`rgba?\(\s*${percent}\s*,\s*${percent}\s*,\s*${percent}\s*(?:,\s*${alpha}\s*)?\)`,
	// Modern rgb/rgba: rgba(1 2 3/0.5)
	String.raw`rgba?\(\s*${numOrPercent}\s+${numOrPercent}\s+${numOrPercent}\s*(?:/\s*${alpha}\s*)?\)`,
];
const hslColorRegexes = [
	// Legacy hsl/hsla: hsl(1deg,2%,3%,0.5)
	String.raw`hsla?\(\s*${hue}\s*,\s*${percent}\s*,\s*${percent}\s*(?:,\s*${alpha}\s*)?\)`,
	// Modern hsl/hsla/hwb: hsla(1deg 2% 3%/0.5)
	String.raw`h(?:sla?|wb)\(\s*${hue}\s+${numOrPercent}\s+${numOrPercent}\s*(?:/\s*${alpha}\s*)?\)`,
];
const namedColorRegex = `aliceblue|antiquewhite|aqua|aquamarine|azure|beige|bisque|black|blanchedalmond|blue|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|cyan|darkblue|darkcyan|darkgoldenrod|darkgray|darkgreen|darkgrey|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkslategrey|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dimgrey|dodgerblue|firebrick|floralwhite|forestgreen|fuchsia|gainsboro|ghostwhite|gold|goldenrod|gray|green|greenyellow|grey|honeydew|hotpink|indianred|indigo|ivory|khaki|lavender|lavenderblush|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgreen|lightgrey|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightslategrey|lightsteelblue|lightyellow|lime|limegreen|linen|magenta|maroon|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|navy|oldlace|olive|olivedrab|orange|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|purple|rebeccapurple|red|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|silver|skyblue|slateblue|slategray|slategrey|snow|springgreen|steelblue|tan|teal|thistle|tomato|turquoise|violet|wheat|white|whitesmoke|yellow|yellowgreen`;

const hexOrNamedColorRegexes = [...hexColorRegexes, namedColorRegex];
const hexOrNamedColorRegex = new RegExp(
	`(${hexOrNamedColorRegexes.join("|")})`,
	"g"
);

const colorRegexes = [
	...hexColorRegexes,
	...rgbColorRegexes,
	...hslColorRegexes,
	namedColorRegex,
];
const colorRegex = new RegExp(`(${colorRegexes.join("|")})`, "g");

export function findColorValues(text: string): ColorMatch[] {
	const matches: ColorMatch[] = [];
	colorRegex.lastIndex = 0;

	let match;
	while ((match = colorRegex.exec(text)) !== null) {
		matches.push({
			from: match.index,
			to: match.index + match[0].length,
			color: match[0],
		});
	}

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
		hexOrNamedColorRegex.lastIndex = 0;
		if (hexOrNamedColorRegex.test(color)) {
			return "hex";
		}
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
