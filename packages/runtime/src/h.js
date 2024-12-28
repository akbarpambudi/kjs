import {withoutNulls} from "./utils/arrays";

export const DOM_TYPES = {
    TEXT: 'text',
    ELEMENT: 'element',
    FRAGMENT: 'fragment',
}

export function h(tag,props = {},children = []) {
    return {
        tag,
        props,
        children: mapTextNodes(withoutNulls(children)),
        type: DOM_TYPES.ELEMENT,
    }
}

export function hText(value) {
    return {
        type: DOM_TYPES.TEXT,
        value,
    }
}

export function hFragment(children) {
    return {
        type: DOM_TYPES.FRAGMENT,
        children: mapTextNodes(withoutNulls(children)),
    }
}

function mapTextNodes(children) {
    return children.map(child => {
        if (typeof child === 'string') {
            return hText(child)
        }
        return child
    })
}