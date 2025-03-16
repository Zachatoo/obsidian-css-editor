import { Completion, CompletionSource } from "@codemirror/autocomplete";
import { cssLanguage, defineCSSCompletionSource } from "@codemirror/lang-css";
import { LanguageSupport, syntaxTree } from "@codemirror/language";
import { EditorSelection, EditorState } from "@codemirror/state";
import { IterMode, NodeWeakMap, SyntaxNode, SyntaxNodeRef } from "@lezer/common";

// Most codes were taken/replicated from "@codemirror/lang-css"
// Add auto-completion logic for class and id selector

const enum SelectorType {
    CLASS = "class",
    ID = "id"
}

const ClassSelectorCtx = ["ClassSelector"];
const IdSelectorCtx = ["IdSelector"];

// Use weak map, so we don't need to manually clear it each time the Tree updated and won't be reused again
const SelectorsByNode = {
    [SelectorType.CLASS]: new NodeWeakMap<Completion[]>(),
    [SelectorType.ID]: new NodeWeakMap<Completion[]>(),
};

const Identifier = /^(\w[\w-]*|-\w[\w-]*|)$/;

function getASTTop(node: SyntaxNode) {
    for (let cur: SyntaxNode | null = node;;) {
        if (cur.type.isTop)
            return cur;
        if (!(cur = cur.parent))
            return node;
    }
}

function isSelectorIdentifier(node: SyntaxNodeRef) {
    if (node.name == "ClassName")
        return SelectorType.CLASS;
    if (node.name == "IdName")
        return SelectorType.ID;
    return false;
}

function touchSelection(selection: EditorSelection, range: { from: number, to: number }) {
    return selection.ranges.findIndex(selRange =>
        selRange.from <= range.to &&
        selRange.to >= range.from
    ) >= 0;
}

// Refer to variableNames() at "@codemirror/lang-css/dist/index.cjs"
// Retrieve list of class/id names to be used in selector auto-completion
function getSelectorNames(state: EditorState, node: SyntaxNode, type: SelectorType) {
    // As a single Tree may consist of several pieces, especially when its length exceeds 4 kB of
    // chars, caching the class/id names and mapping them to the correspond node could be an efficient way
    if (node.to - node.from > 4096) {
        let known = SelectorsByNode[type].get(node);
        if (known)
            return known;

        let result: Completion[] = [],
            seen = new Set<string>(),
            cursor = node.cursor(IterMode.IncludeAnonymous);
        if (cursor.firstChild())
            do {
                for (let option of getSelectorNames(state, cursor.node, type))
                    if (!seen.has(option.label)) {
                        seen.add(option.label);
                        result.push(option);
                    }
            } while (cursor.nextSibling());
        SelectorsByNode[type].set(node, result);
        return result;
    }

    else {
        let result: Completion[] = [],
            seen = new Set<string>(),
            { doc, selection } = state;
        node.cursor().iterate(node => {
            if (type == isSelectorIdentifier(node) && !touchSelection(selection, node)) {
                let name = doc.sliceString(node.from, node.to);
                if (!seen.has(name)) {
                    seen.add(name);
                    result.push({ label: name, type: "variable" });
                }
            }
        });
        return result;
    }
}

const cssCompletionSource: CompletionSource = context => {
    // Original
    let result = defineCSSCompletionSource(node => node.name == "VariableName")(context);

    if (!result) {
        let { state, pos } = context,
            node = syntaxTree(state).resolveInner(pos, -1);
        
        // Class selector
        if (node.matchContext(ClassSelectorCtx)) {
            let isDot = node.name == ".";
            result = {
                from: isDot ? node.to : node.from,
                options: getSelectorNames(state, getASTTop(node), SelectorType.CLASS),
                validFor: Identifier
            };
        }
        
        // Id selector
        else if (node.matchContext(IdSelectorCtx)) {
            let isHash = node.name == "#";
            result = {
                from: isHash ? node.to : node.from,
                options: getSelectorNames(state, getASTTop(node), SelectorType.ID),
                validFor: Identifier
            };
        }
    }

    return result;
}

export const css = () => new LanguageSupport(cssLanguage, cssLanguage.data.of({ autocomplete: cssCompletionSource }));