import { cssLanguage } from "@codemirror/lang-css";

/** A modified CSS language that starts in "block" state */
export const inlineCssLanguage = cssLanguage.configure({
	top: "Styles",
});
