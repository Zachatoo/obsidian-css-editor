import { lineNumbers } from "@codemirror/view";
import { Compartment, EditorState, Extension } from "@codemirror/state";
import { foldedRanges } from "@codemirror/language";

export const relativeLineNumberGutter = new Compartment();

// Cache for the digit count in line numbers
const charLengthCache = new WeakMap<EditorState, number>();

 function relativeLineNumbersFormatter(lineNo: number, state: EditorState): string {
	// Get the cached value or compute a new one
	 let charLength = charLengthCache.get(state);
	 if (!charLength) {
		charLength = state.doc.lines.toString().length;
		charLengthCache.set(state, charLength);
		}

	 if (lineNo > state.doc.lines) {
		 return " ".padStart(charLength, " ");
	    }

	 // Cache the selection and folds once 
 	 const selection = state.selection.asSingle();
		if (!selection.ranges[0]) {
			return " ".padStart(charLength, " ");
		}
	 const cursorLine = state.doc.lineAt(selection.ranges[0].to).number;
	 const folds = foldedRanges(state);

	 if (lineNo === cursorLine) {
		 return lineNo.toString().padStart(charLength, " ");
	 }

	 // Calculate the number of folds between the cursor and the current line 
	 const start = Math.min(cursorLine, lineNo);
	 const stop = Math.max(cursorLine, lineNo);
	 let foldedCount = 0;

	 folds.between(
		 state.doc.line(start).from,
		 state.doc.line(stop).to,
		 () => { foldedCount++; }
	 );

	 const distance = Math.abs(cursorLine - lineNo) - foldedCount;
	 return distance.toString().padStart(charLength, " ");
 }

 function absoluteLineNumbers(lineNo: number, state: EditorState): string {
	 let charLength = charLengthCache.get(state);
	 if (!charLength) {
		 charLength = state.doc.lines.toString().length;
		 charLengthCache.set(state, charLength);
	 }
	 return lineNo.toString().padStart(charLength, " ");
 }

 export const getLineNumbersExtension = (useRelative = false): Extension[] => {
	 const formatNumber = useRelative
		 ? relativeLineNumbersFormatter
		 : absoluteLineNumbers;

	 return [
		 relativeLineNumberGutter.of(lineNumbers({ formatNumber }))
	 ];
 };

 export { relativeLineNumbersFormatter, absoluteLineNumbers };
