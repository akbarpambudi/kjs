import {DOM_TYPES} from "./h";


const createNodeSelector = {
    [DOM_TYPES.TEXT]: createTextNode,
    [DOM_TYPES.ELEMENT]: createElementNode,
    [DOM_TYPES.FRAGMENT]: createFragmentNode,
}

const removeNodeSelector = {
    [DOM_TYPES.TEXT]: removeTextNode,
    [DOM_TYPES.ELEMENT]:removeElementNode,
    [DOM_TYPES.FRAGMENT]: removeFragmentNode,
}

export function mountDom(virtualDom,parentElement) {
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
        virtualDom.type,
        parentElement)
}


export function destroyDom(virtualDom) {
    const removeNode = removeNodeSelector[virtualDom.type]
    if (!removeNode) {
        throw new Error('Cannot remove node for type: ' + virtualDom.type + '')
    }

    removeNode(virtualDom)
}

function createTextNode(vDom,parentEl) {
    const {value} = vDom
    const textNode = document.createTextNode(value)
    vDom.el = textNode
    parentEl.append(
        textNode)
}

function removeTextNode(vDom) {
    const {el} = vDom
    el.remove()
}

function createElementNode(vDom,parentEl) {
    const {tag,props,children} = vDom
    const el = document.createElement(tag)

    addProps(el,props,vDom)

    vDom.el = el

    children.forEach(child => mountDom(child,vDom.el))

    parentEl.append(el)
}

function removeElementNode(vDom) {
    const {el,children,listeners} = vDom
    el.remove()

    children.forEach(child => destroyDom(child))

    if (listeners) {
        removeEventListeners(listeners,el)
        delete vDom.listeners
    }
}

function createFragmentNode(vDom,parentEl) {
    const {children} = vDom
    vDom.el = parentEl

    children.forEach(child => {
        mountDom(child.type,child,vDom.el)
    })
}

function removeFragmentNode(vDom) {
    const {children} = vDom

    children.forEach(child => destroyDom(child))
}


function addProps(el,props,vDom) {
    const {on:events, ...rest} = props

    vDom.listeners = addEventListeners(events,el)

    setAttributes(el,rest)
}

function addEventListeners(eventListeners,el){
    const addedEventListeners = {}

    Object.entries(eventListeners).forEach(([eventName,handler]) => {
        el.addEventListener(eventName,handler)
        addedEventListeners[eventName] = handler
    })

    return addedEventListeners
}

function removeEventListeners(eventListeners,el){
    Object.entries(eventListeners).forEach(([eventName,handler]) => {
        el.removeEventListener(eventName,handler)
    })
}

function setAttributes(el,attrs) {
    const {style,class:className,...rest} = attrs

    if(className) {
        setClass(el,className)
    }

    if(style){
        Object.entries(style).forEach(([key,value]) => {
            setStyle(el,key,value)
        })
    }

    for(const [key,value] of Object.entries(rest)) {
        setAttribute(el,key,value)
    }
}

function setClass(el,className) {
    el.className = ''

    if (typeof className === 'string') {
        el.className = className
    }

    if (Array.isArray(className)) {
        el.classList.add(...className)
    }
}

function setStyle(el,key,value) {
    el.style[key] = value
}

function removeStyle(el,key) {
    el.style[key] = ''
}

function setAttribute(el,key,value) {
    if(value === null || value === undefined) {
        removeAttribute(el,key)
    } else if (key.startsWith('data-')){
        el.setAttribute(key,value)
    } else {
        el[key] = value
    }
}

function removeAttribute(el,key) {
    el[key] = null
    el.removeAttribute(key)
}