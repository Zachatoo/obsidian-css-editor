import {
	defaultKeymap,
	history,
	historyKeymap,
	indentWithTab,
} from "@codemirror/commands";;
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
} from "@codemirror/autocomplete";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import { lintKeymap } from "@codemirror/lint";
import { obsidian } from "./obsidian-theme";
import { css } from "./reconfigured-css";

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
	bracketMatching(),
	autocompletion(),
	closeBrackets(),
	highlightSelectionMatches(),
	obsidian,
].filter((ext) => ext);
