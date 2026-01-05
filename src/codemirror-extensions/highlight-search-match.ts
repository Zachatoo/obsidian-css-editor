import { Range, StateEffect, StateField } from "@codemirror/state";
import { Decoration, EditorView } from "@codemirror/view";

export const highlightEffect = StateEffect.define<Range<Decoration>[]>();

export const highlightSearchMatch = StateField.define({
	create() {
		return Decoration.none;
	},
	update(value, transaction) {
		value = value.map(transaction.changes);

		for (let effect of transaction.effects) {
			if (effect.is(highlightEffect))
				value = value.update({
					add: effect.value,
					sort: true,
					filter: () => false,
				});
		}

		return value;
	},
	provide: (f) => EditorView.decorations.from(f),
});

export const highlightDecoration = Decoration.mark({
	class: "obsidian-search-match-highlight",
});
