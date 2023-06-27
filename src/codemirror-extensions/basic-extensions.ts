import {
	defaultKeymap,
	history,
	historyKeymap,
	indentWithTab,
} from "@codemirror/commands";
import { css } from "@codemirror/lang-css";
import {
	bracketMatching,
	foldGutter,
	foldKeymap,
	indentOnInput,
} from "@codemirror/language";
import { EditorState, Extension } from "@codemirror/state";
import { dropCursor, EditorView, keymap } from "@codemirror/view";
import {
	autocompletion,
	closeBrackets,
	closeBracketsKeymap,
	completionKeymap,
	// insertBracket,
} from "@codemirror/autocomplete";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import { lintKeymap } from "@codemirror/lint";
import { obsidian } from "../obsidian-theme";

console.log(closeBrackets());

export const basicExtensions: Extension[] = [
	keymap.of([
		...closeBracketsKeymap, // "{|}" -> backspace -> "|"
		...defaultKeymap,
		...searchKeymap,
		...historyKeymap,
		indentWithTab,
		...foldKeymap,
		...completionKeymap,
		...lintKeymap,
	]),
	history(),
	css(),
	foldGutter(),
	dropCursor(),
	EditorState.allowMultipleSelections.of(true),
	indentOnInput(),
	EditorView.lineWrapping,
	bracketMatching(),
	autocompletion(),
	closeBrackets(),
	highlightSelectionMatches(),
	obsidian,
].filter((ext) => ext);
