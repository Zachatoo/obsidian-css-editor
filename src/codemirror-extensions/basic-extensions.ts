import {
	defaultKeymap,
	historyKeymap,
	indentWithTab,
} from "@codemirror/commands";
import {
	bracketMatching,
	foldGutter,
	foldKeymap,
	indentOnInput,
} from "@codemirror/language";
import { EditorState, Extension } from "@codemirror/state";
import {
	dropCursor,
	keymap,
	lineNumbers,
	highlightActiveLineGutter,
	drawSelection,
} from "@codemirror/view";
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
import { highlightActiveLine } from "./highlight-active-line";
import { vim } from "@replit/codemirror-vim";

export const basicExtensions: Extension[] = [
	vim(),
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
	css(),
	lineNumbers(),
	foldGutter(),
	highlightActiveLineGutter(),
	dropCursor(),
	drawSelection({ drawRangeCursor: true }),
	EditorState.allowMultipleSelections.of(true),
	highlightActiveLine(),
	indentOnInput(),
	bracketMatching(),
	autocompletion(),
	closeBrackets(),
	highlightSelectionMatches(),
	obsidian,
].filter((ext) => ext);
