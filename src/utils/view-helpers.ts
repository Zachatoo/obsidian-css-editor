export function focusAndSelectElement(el: HTMLElement) {
	el.focus({ preventScroll: true });
	const range = activeDocument.createRange();
	range.selectNodeContents(el);
	const selection = getSelection();
	if (selection) {
		selection.removeAllRanges();
		selection.addRange(range);
	}
}
