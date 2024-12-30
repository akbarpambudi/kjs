import {DOM_TYPES} from "./h";

const removeNodeSelector = {
    [DOM_TYPES.TEXT]: removeTextNode,
    [DOM_TYPES.ELEMENT]:removeElementNode,
    [DOM_TYPES.FRAGMENT]: removeFragmentNode,
}


export function destroyDom(virtualDom) {
    const removeNode = removeNodeSelector[virtualDom.type]
    if (!removeNode) {
        throw new Error('Cannot remove node for type: ' + virtualDom.type + '')
    }

    removeNode(virtualDom)
}

function removeTextNode(vDom) {
    const {el} = vDom
    el.remove()
    delete vDom.el
}


function removeElementNode(vDom) {
    const {el,children,listeners} = vDom
    el.remove()

    children.forEach(child => destroyDom(child))

    if (listeners) {
        removeEventListeners(listeners,el)
        delete vDom.listeners
    }

    delete vDom.el
}

function removeFragmentNode(vDom) {
    const {children} = vDom

    children.forEach(child => destroyDom(child))
}


function removeEventListeners(eventListeners,el){
    Object.entries(eventListeners).forEach(([eventName,handler]) => {
        el.removeEventListener(eventName,handler)
    })
}
