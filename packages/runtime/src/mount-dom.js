import {DOM_TYPES} from "./h";
import {addEventListeners, setAttributes} from "./dom-manipulator";


const createNodeSelector = {
    [DOM_TYPES.TEXT]: createTextNode,
    [DOM_TYPES.ELEMENT]: createElementNode,
    [DOM_TYPES.FRAGMENT]: createFragmentNode,
}


export function mountDom(virtualDom,parentElement,index = null) {
    if (!parentElement) {
        throw new Error('parentElement is required')
    }

    if (!virtualDom) {
        throw new Error('virtualDom is required')
    }


    const createNode = createNodeSelector[virtualDom.type]
    if (!createNode) {
        throw new Error('Cannot create node for type: ' + virtualDom.type + '')
    }

    createNode(
        virtualDom,
        parentElement,
        index)
}

function createTextNode(vDom,parentEl,index) {
    const {value} = vDom
    const textNode = document.createTextNode(value)
    vDom.el = textNode
    insert(textNode,parentEl,index)
}

function createElementNode(vDom,parentEl,index) {
    const {tag,props,children} = vDom
    const el = document.createElement(tag)

    addProps(el,props,vDom)

    vDom.el = el

    children.forEach(child => mountDom(child,vDom.el))

    insert(el,parentEl,index)
}

function createFragmentNode(vDom,parentEl,index) {
    const {children} = vDom
    vDom.el = parentEl

    children.forEach((child,i) => {
        mountDom(child,vDom.el,index? index+i:null)
    })
}

function addProps(el,props,vDom) {
    const {on:events, ...rest} = props ?? {}

    vDom.listeners = addEventListeners(events,el)

    setAttributes(el,rest)
}

function insert(el,parentEl,index) {
    if(index === null || index === undefined) {
        parentEl.append(el)
        return
    }

    if(index < 0) {
        throw new Error('index must be >= 0')
    }

    const children = Array.from(parentEl.children)
    if(index >= children.length) {
        parentEl.append(el)
    }else {
        parentEl.insertBefore(el,children[index])
    }
}