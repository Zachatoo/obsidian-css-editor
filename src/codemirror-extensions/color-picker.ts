import {
	EditorView,
	Decoration,
	DecorationSet,
	ViewPlugin,
	ViewUpdate,
	WidgetType,
} from "@codemirror/view";
import { Range } from "@codemirror/state";
import { ColorComponent } from "obsidian";

interface ColorMatch {
	from: number;
	to: number;
	color: string;
}

class ColorPickerWidget extends WidgetType {
	constructor(
		private color: string,
		private from: number,
		private to: number,
		private view: EditorView
	) {
		super();
	}

	eq(other: ColorPickerWidget): boolean {
		return (
			this.color === other.color &&
			this.from === other.from &&
			this.to === other.to
		);
	}

	toDOM(): HTMLElement {
		const wrapper = document.createElement("span");
		wrapper.className = "css-editor-color-picker-wrapper";

		const colorComponent = new ColorComponent(wrapper);
		colorComponent.setValue(this.color);

		colorComponent.onChange((newColor) => {
			this.view.dispatch({
				changes: {
					from: this.from,
					to: this.to,
					insert: newColor,
				},
			});
		});

		return wrapper;
	}
}

function findColorValues(text: string): ColorMatch[] {
	const matches: ColorMatch[] = [];
	const hexColorRegex = /#([a-fA-F0-9]{3}|[a-fA-F0-9]{6}|[a-fA-F0-9]{8})\b/g;

	let match;
	while ((match = hexColorRegex.exec(text)) !== null) {
		matches.push({
			from: match.index,
			to: match.index + match[0].length,
			color: match[0],
		});
	}

	return matches.sort((a, b) => a.from - b.from);
}

const colorPickerPlugin = ViewPlugin.fromClass(
	class {
		decorations: DecorationSet;

		constructor(view: EditorView) {
			this.decorations = this.buildDecorations(view);
		}

		update(update: ViewUpdate) {
			if (update.docChanged || update.viewportChanged) {
				this.decorations = this.buildDecorations(update.view);
			}
		}

		buildDecorations(view: EditorView): DecorationSet {
			const builder = new Array<Range<Decoration>>();
			const doc = view.state.doc;
			const text = doc.toString();

			if (!doc || doc.length === 0) {
				return Decoration.set([]);
			}

			const colorMatches = findColorValues(text);

			for (const match of colorMatches) {
				if (
					match.from < 0 ||
					match.to > doc.length ||
					match.from >= match.to
				) {
					continue;
				}

				const line = doc.lineAt(match.from);
				if (
					view.viewport.from <= line.to &&
					line.from <= view.viewport.to
				) {
					const decoration = Decoration.widget({
						widget: new ColorPickerWidget(
							match.color,
							match.from,
							match.to,
							view
						),
						side: 1,
					});
					builder.push(decoration.range(match.to));
				}
			}

			return Decoration.set(builder);
		}

		destroy() {
			this.decorations = Decoration.set([]);
		}
	},
	{
		decorations: (v) => v.decorations,
	}
);

export { colorPickerPlugin };
