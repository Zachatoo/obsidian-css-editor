import { layer, LayerMarker, RectangleMarker } from "@codemirror/view";

// We don't use builtin active line highlighter from CodeMirror,
// because it sets the background of active line DOM, which can cause
// blocking appearance of selection that's drawn via DOM (not native selection),
// e.g. the second selection (or all of selections when "drawSelection()"
// is registered).
export function highlightActiveLine() {
    return activeLineLayer;
}

// Use layer instead decoration
const activeLineLayer = layer({
    above: false,
    class: "cm-activeLineLayer",
    markers(view) {
        const selection = view.state.selection,
            markers: LayerMarker[] = [],
            paddingTop = view.documentPadding.top,
            { width, left: contentLeft } = view.contentDOM.getBoundingClientRect(),
            { left: scrollerLeft } = view.scrollDOM.getBoundingClientRect();

        for (const range of selection.ranges) {
            const { top, height } = view.lineBlockAt(range.head),
                layer = new RectangleMarker("cm-activeLine", contentLeft - scrollerLeft, top + paddingTop, width, height);
            markers.push(layer);
        }
        return markers;
    },
    update(update) {
        return update.docChanged || update.selectionSet || update.viewportChanged || update.geometryChanged;
    }
});