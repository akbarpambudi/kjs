import {isNodeEquals} from "./node-equality";
import {destroyDom} from "./destroy-dom";
import {mountDom} from "./mount-dom";
import {DOM_TYPES} from "./h";
import {arraysDiff, objectsDiff} from "./utils/diff";
import {
    addEventListener,
    removeAttribute,
    removeStyle,
    setAttribute,
    setStyle
} from "./dom-manipulator";
import {isNotBlankOrEmptyString} from "./utils/strings";
import {ARRAY_DIFF_OP, generateTransformationsSequence} from "./utils/array-transformations";


export function patchDom(originalVirtualDom,patchVirtualDom,parentElement) {
    console.log("patchDom ...")
    if(!isNodeEquals(originalVirtualDom,patchVirtualDom)){
        console.log("patchDom ... no is not equals")
        const index = findIndexInParentElement(originalVirtualDom.el,parentElement)
        destroyDom(originalVirtualDom)
        mountDom(patchVirtualDom,parentElement,index)

        return patchVirtualDom
    }

    patchVirtualDom.el = originalVirtualDom.el

    switch (patchVirtualDom.type) {
        case DOM_TYPES.TEXT:
            console.log("patchDom ... try patching text")
            return patchText(originalVirtualDom,patchVirtualDom)
        case DOM_TYPES.ELEMENT:
            console.log("patchDom ... try patching elements")
            patchElement(originalVirtualDom,patchVirtualDom)
            break
    }

    console.log("patchDom ... try patching children")
    patchChildren(originalVirtualDom,patchVirtualDom)

    return patchVirtualDom
}

function findIndexInParentElement(el,parentEl){
    const index = Array.from(parentEl.childNodes).indexOf(el)
    if(index < 0){
        return null
    }

    return index
}

function patchText(originVdom,patchVdom){
    const originText = originVdom.value
    const targetText = patchVdom.value

    if(originText === targetText){
        return patchVdom
    }

    patchVdom.el.nodeValue = targetText
    return patchVdom
}

function patchElement(originVdom,patchVdom){
    const el = originVdom.el

    const {
        'class': originClass,
        style: originStyle,
        on: originEvents,
        ...originAttributes
    } = originVdom.props ?? {};

    const {
        'class': patchClass,
        style: patchStyle,
        on: patchEvents,
        ...patchAttributes
    } = patchVdom.props ?? {};
    const { listeners: originalListeners } = originVdom
    console.log("patchElement ...")
    console.log("originStyle: ", originStyle)
    console.log("patchStyle: ", patchStyle)

    patchAttrs(el,originAttributes,patchAttributes)
    patchClasses(el,originClass,patchClass)
    patchStyles(el,originStyle,patchStyle)
    patchVdom.listeners = patchEventListeners(el,originalListeners,originEvents,patchEvents)
}

function patchAttrs(el,originAttributes,patchAttributes){
    console.log("patchAttrs ...")
    console.log("originAttributes: ", originAttributes)
    console.log("patchAttributes: ", patchAttributes)
    const {added,removed,updated} = objectsDiff(originAttributes,patchAttributes)
    console.log("added: ", added)
    console.log("removed: ", removed)
    console.log("updated: ", updated)

    for(let key of removed){
        removeAttribute(el,key)
    }

    for(let key of [...added,...updated]){
        console.log("key: ", key)
        console.log("patchAttributes[key]: ", patchAttributes[key])
        setAttribute(el,key,patchAttributes[key])
    }
}

function patchClasses(el,originClass,patchClass){
    const originalClassList = toClassList(originClass)
    const patchClassList = toClassList(patchClass)

    const {added,removed} = arraysDiff(originalClassList,patchClassList)

    if(added.length > 0){
        el.classList.add(...added)
    }

    if(removed.length > 0){
        el.classList.remove(...removed)
    }
}

function patchEventListeners(el,originalEventListener = {}, originEvents = {},patchEvents = {}){
    const {added,removed,updated} = objectsDiff(originEvents,patchEvents)
    console.log("patchEventListeners ...")
    console.log("added: ", added)
    console.log("removed: ", removed)
    console.log("updated: ", updated)
    console.log("originEvents: ", originEvents)
    console.log("patchEvents: ", patchEvents)

    let addEventListeners = {}
    for(let eventName of [...removed,...updated]){
        el.removeEventListener(eventName,originalEventListener[eventName])
    }

    for(let eventName of [...added,...updated]){
        addEventListeners[eventName] = addEventListener(el,eventName,patchEvents[eventName])
    }

    return addEventListeners
}

function patchStyles(el,originalStyles,patchStyles){
    const {added,removed,updated} = objectsDiff(originalStyles,patchStyles)
    console.log("patchStyles ...")
    console.log("added: ", added)
    console.log("removed: ", removed)
    console.log("updated: ", updated)

    for(let key of removed){
        removeStyle(el,key)
    }

    for(let key of [...added,...updated]){
        setStyle(el,key,patchStyles[key])
    }
}

export function extractChildren(vdom) {
    if (vdom.children == null) {
        return []
    }

    const children = []

    for (const child of vdom.children) {
        if (child.type === DOM_TYPES.FRAGMENT) {
            children.push(...extractChildren(child, children))
        } else {
            children.push(child)
        }
    }

    return children
}

function patchChildren(originVdom,patchVdom){
    const originChildren = extractChildren(originVdom)
    const patchChildren = extractChildren(patchVdom)
    const parentEl = originVdom.el

    const transformationSequence = generateTransformationsSequence(originChildren,patchChildren,isNodeEquals)

    for(const op of transformationSequence){
        const { originalIndex, index, item } = op
        switch (op.operation){
            case ARRAY_DIFF_OP.ADD:
                mountDom(item,parentEl,index)
                break
            case ARRAY_DIFF_OP.MOVE:
                moveChildren(originChildren,patchChildren,parentEl,originalIndex,index)
                break
            case ARRAY_DIFF_OP.REMOVE:
                destroyDom(item)
                break
            case ARRAY_DIFF_OP.NOOP:
                patchDom(originChildren[originalIndex],patchChildren[index],parentEl)
                break
        }
    }
}

function moveChildren(originChildren,patchChildren,parentEl,originalIndex,index){
    const el = originChildren[originalIndex].el
    const elAtTargetIndex = parentEl.childNodes[index]

    parentEl.insertBefore(el,elAtTargetIndex)
    patchDom(originChildren[originalIndex],patchChildren[index],parentEl)
}

function toClassList(classes){
    if(classes === null || classes === undefined){
        return []
    }

    if(Array.isArray(classes)){
        return classes.filter(isNotBlankOrEmptyString)
    }else if(typeof classes === 'string'){
        return classes.split(/(\s+)/).filter(isNotBlankOrEmptyString)
    }

    return []
}