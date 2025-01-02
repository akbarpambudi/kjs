function withoutNulls(arr) {
    if(!Array.isArray(arr)){
        return []
    }
    return arr.filter(item => item !== null && item !== undefined)
}

const DOM_TYPES = {
    TEXT: 'text',
    ELEMENT: 'element',
    FRAGMENT: 'fragment',
};
function h(tag,props = {},children = []) {
    return {
        tag,
        props,
        children: mapTextNodes(withoutNulls(children)),
        type: DOM_TYPES.ELEMENT,
    }
}
function hText(value) {
    return {
        type: DOM_TYPES.TEXT,
        value,
    }
}
function hFragment(children) {
    return {
        type: DOM_TYPES.FRAGMENT,
        children: mapTextNodes(withoutNulls(children)),
    }
}
function mapTextNodes(children) {
    return children.map(child => {
        console.log("child: ", child);
        console.log("typeof child: ", typeof child);
        if (typeof child === 'string') {
            return hText(child)
        }
        return child
    })
}

function addEventListeners(eventListeners,el){
    const addedEventListeners = {};
    if(!eventListeners) {
        return addedEventListeners
    }
    Object.entries(eventListeners).forEach(([eventName,handler]) => {
        addedEventListeners[eventName] = addEventListener(el,eventName,handler);
    });
    return addedEventListeners
}
function addEventListener(el,eventName,handler){
    el.addEventListener(eventName,handler);
    return handler
}
function setAttributes(el,attrs) {
    const {style,'class':className,...rest} = attrs;
    if(className) {
        setClass(el,className);
    }
    if(style){
        Object.entries(style).forEach(([key,value]) => {
            setStyle(el,key,value);
        });
    }
    for(const [key,value] of Object.entries(rest)) {
        setAttribute(el,key,value);
    }
}
function setClass(el,className) {
    el.className = '';
    if (typeof className === 'string') {
        el.className = className;
    }
    if (Array.isArray(className)) {
        el.classList.add(...className);
    }
}
function setStyle(el,key,value) {
    console.log("setStyle ...");
    console.log("key: ", key);
    el.style[key] = value;
}
function removeStyle(el,key){
    el.style[key] = null;
}
function setAttribute(el,key,value) {
    if(value === null || value === undefined) {
        removeAttribute(el,key);
    } else if (key.startsWith('data-')){
        el.setAttribute(key,value);
    } else {
        el[key] = value;
    }
}
function removeAttribute(el,key) {
    el[key] = null;
    el.removeAttribute(key);
}

const createNodeSelector = {
    [DOM_TYPES.TEXT]: createTextNode,
    [DOM_TYPES.ELEMENT]: createElementNode,
    [DOM_TYPES.FRAGMENT]: createFragmentNode,
};
function mountDom(virtualDom,parentElement,index = null) {
    if (!parentElement) {
        throw new Error('parentElement is required')
    }
    if (!virtualDom) {
        throw new Error('virtualDom is required')
    }
    const createNode = createNodeSelector[virtualDom.type];
    if (!createNode) {
        throw new Error('Cannot create node for type: ' + virtualDom.type + '')
    }
    createNode(
        virtualDom,
        parentElement,
        index);
}
function createTextNode(vDom,parentEl,index) {
    const {value} = vDom;
    const textNode = document.createTextNode(value);
    vDom.el = textNode;
    insert(textNode,parentEl,index);
}
function createElementNode(vDom,parentEl,index) {
    const {tag,props,children} = vDom;
    const el = document.createElement(tag);
    addProps(el,props,vDom);
    vDom.el = el;
    children.forEach(child => mountDom(child,vDom.el));
    insert(el,parentEl,index);
}
function createFragmentNode(vDom,parentEl,index) {
    const {children} = vDom;
    vDom.el = parentEl;
    children.forEach((child,i) => {
        mountDom(child,vDom.el,index? index+i:null);
    });
}
function addProps(el,props,vDom) {
    const {on:events, ...rest} = props ?? {};
    vDom.listeners = addEventListeners(events,el);
    setAttributes(el,rest);
}
function insert(el,parentEl,index) {
    if(index === null || index === undefined) {
        parentEl.append(el);
        return
    }
    if(index < 0) {
        throw new Error('index must be >= 0')
    }
    const children = Array.from(parentEl.children);
    if(index >= children.length) {
        parentEl.append(el);
    }else {
        parentEl.insertBefore(el,children[index]);
    }
}

const removeNodeSelector = {
    [DOM_TYPES.TEXT]: removeTextNode,
    [DOM_TYPES.ELEMENT]:removeElementNode,
    [DOM_TYPES.FRAGMENT]: removeFragmentNode,
};
function destroyDom(virtualDom) {
    const removeNode = removeNodeSelector[virtualDom.type];
    if (!removeNode) {
        throw new Error('Cannot remove node for type: ' + virtualDom.type + '')
    }
    removeNode(virtualDom);
}
function removeTextNode(vDom) {
    const {el} = vDom;
    el.remove();
    delete vDom.el;
}
function removeElementNode(vDom) {
    const {el,children,listeners} = vDom;
    if (!el){
        return
    }
    el.remove();
    children.forEach(child => destroyDom(child));
    if (listeners) {
        removeEventListeners(listeners,el);
        delete vDom.listeners;
    }
    delete vDom.el;
}
function removeFragmentNode(vDom) {
    const {children} = vDom;
    children.forEach(child => destroyDom(child));
    delete vDom.el;
}
function removeEventListeners(eventListeners,el){
    Object.entries(eventListeners).forEach(([eventName,handler]) => {
        el.removeEventListener(eventName,handler);
    });
}

class Dispatcher {
    constructor(){
        this._subs = new Map();
        this._afterEveryCommandHandlers = [];
    }
    subscribe(command,handler) {
        if (!this._subs.has(command)) {
            this._subs.set(command,[]);
        }
        const handlers = this._subs.get(command);
        if(handlers.includes(handler)){
            return ()=>{}
        }
        handlers.push(handler);
        return ()=>{
            const idx = this._subs.get(command).indexOf(handler);
            handlers.splice(idx,1);
        }
    }
    afterEveryCommand(handler){
        this._afterEveryCommandHandlers.push(handler);
        return ()=>{
            const idx = this._afterEveryCommandHandlers.indexOf(handler);
            this._afterEveryCommandHandlers.splice(idx,1);
        }
    }
    dispatch(command,payload){
        if (this._subs.has(command)) {
            const handlers = this._subs.get(command);
            handlers.forEach(handler => handler(payload));
        } else {
            console.warn(`No handlers for command: ${command}`);
        }
        const afterEveryCommandHandlers = this._afterEveryCommandHandlers;
        afterEveryCommandHandlers.forEach(handler => handler(command,payload));
    }
}

function isNodeEquals(node1,node2){
    if(node1.type !== node2.type){
        return false
    }
    if(node1.type === DOM_TYPES.ELEMENT){
        return node1.tag === node2.tag
    }
    return true
}

function objectsDiff(obj1, obj2) {
    const added = [];
    const removed = [];
    const updated = [];
    obj1 = obj1 || {};
    obj2 = obj2 || {};
    const obj1Keys = Object.keys(obj1);
    const obj2Keys = Object.keys(obj2);
    const obj1KeysSet = new Set(obj1Keys);
    const obj2KeysSet = new Set(obj2Keys);
    for (const key of obj1Keys) {
        if (!obj2KeysSet.has(key)) {
            removed.push(key);
        } else if (obj1[key] !== obj2[key]) {
            updated.push(key);
        }
    }
    for (const key of obj2Keys) {
        if (!obj1KeysSet.has(key)) {
            added.push(key);
        }
    }
    return {added, removed, updated}
}
function arraysDiff(arr1, arr2) {
    const removed = [];
    const added = [];
    const countFreqArr1 = {};
    const countFreqArr2 = {};
    const arrMap = {};
    for (const item of arr1) {
        countFreqArr1[item] = (countFreqArr1[item] || 0) + 1;
        arrMap[item] = item;
    }
    for (const item of arr2) {
        countFreqArr2[item] = (countFreqArr2[item] || 0) + 1;
        arrMap[item] = item;
    }
    const keysSet = new Set(Object.keys(arrMap));
    for (const key of keysSet) {
        const freq1 = countFreqArr1[key] || 0;
        const freq2 = countFreqArr2[key] || 0;
        const diff = freq1 - freq2;
        if (diff !== 0){
            if (diff > 0) {
                for (let i = 0; i < diff; i++) {
                    removed.push(arrMap[key]);
                }
            } else {
                const d = -1 * diff;
                for (let i = 0; i < d; i++) {
                    added.push(arrMap[key]);
                }
            }
        }
    }
    return {removed, added}
}

function isNotEmptyString(str){
    return str !== ''
}
function isNotBlankOrEmptyString(str){
    if(str === null || str === undefined){
        return false
    }
    return isNotEmptyString(str.trim())
}

const ARRAY_DIFF_OP = {
    ADD: 'add',
    REMOVE: 'remove',
    MOVE: 'move',
    NOOP: 'noop'
};
function generateTransformationsSequence(originalArr,newArr,equalityFn = (a,b) => a === b) {
    const transformationSequence = [];
    const wrappedOriginalArr = new TransformationOriginArrayWrapper(originalArr,equalityFn);
    let index = 0;
    let infiniteLoopCounter = 0;
    while(index < newArr.length && infiniteLoopCounter < 100000) {
        infiniteLoopCounter++;
        if(wrappedOriginalArr.isRemovalOperation(newArr,index)) {
            transformationSequence.push(wrappedOriginalArr.removeItem(index));
            continue
        } else if (wrappedOriginalArr.isNoopOperation(newArr,index)) {
            transformationSequence.push(wrappedOriginalArr.noopItem(index));
        } else if (wrappedOriginalArr.isAdditionOperation(newArr,index)) {
            const item = newArr[index];
            transformationSequence.push(wrappedOriginalArr.addItem(item,index));
        } else {
            const item = newArr[index];
            transformationSequence.push(wrappedOriginalArr.moveItem(item,index));
        }
        index++;
    }
    transformationSequence.push(...wrappedOriginalArr.removeItemsAfter(index));
    return transformationSequence
}
class TransformationOriginArrayWrapper {
    constructor(arr,equalityFn = (a,b) => a === b) {
        this._arr = [...arr];
        this._originalIndexes = arr.map((item, index) => index);
        this._equalityFn = equalityFn;
    }
    get length() {
        return this._arr.length
    }
    originalIndexAt(index){
        return this._originalIndexes[index]
    }
    findIndexStartedAt(item,initialIndex){
        for (let i = initialIndex; i < this._arr.length; i++) {
            if(this._equalityFn(item,this._arr[i])){
                return i
            }
        }
        return -1
    }
    isRemovalOperation(newArr,index) {
        if(index >= this._arr.length) {
            return false
        }
        const item = this._arr[index];
        const indexInNewArr = newArr.findIndex(item2 => this._equalityFn(item,item2));
        return indexInNewArr === -1
    }
    isNoopOperation(newArr,index) {
        if(index >= this._arr.length) {
            return false
        }
        return this._equalityFn(this._arr[index],newArr[index])
    }
    isAdditionOperation(newArr,index) {
        return this.findIndexStartedAt(newArr[index],index) === -1
    }
    removeItem(index){
        const operation = {
            operation: ARRAY_DIFF_OP.REMOVE,
            index,
            item: this._arr[index]
        };
        this._arr.splice(index,1);
        this._originalIndexes.splice(index,1);
        return operation
    }
    noopItem(index){
        return {
            operation: ARRAY_DIFF_OP.NOOP,
            originalIndex: this.originalIndexAt(index),
            index,
            item: this._arr[index]
        }
    }
    addItem(item,index){
        const operation = {
            operation: ARRAY_DIFF_OP.ADD,
            index,
            item
        };
        this._arr.splice(index,0,item);
        this._originalIndexes.splice(index,0,-1);
        return operation
    }
    moveItem(item,toIndex){
        const fromIndex = this.findIndexStartedAt(item, toIndex);
        const operation = {
            operation: ARRAY_DIFF_OP.MOVE,
            originalIndex: this.originalIndexAt(fromIndex),
            from: fromIndex,
            index: toIndex,
            item
        };
        const [_item] = this._arr.splice(fromIndex,1);
        this._arr.splice(toIndex,0,_item);
        const [originalIndex] = this._originalIndexes.splice(fromIndex,1);
        this._originalIndexes.splice(toIndex,0,originalIndex);
        return operation
    }
    removeItemsAfter(index){
        const operations = [];
        while (this.length > index) {
            operations.push(this.removeItem(index));
        }
        return operations
    }
}

function patchDom(originalVirtualDom,patchVirtualDom,parentElement) {
    console.log("patchDom ...");
    if(!isNodeEquals(originalVirtualDom,patchVirtualDom)){
        console.log("patchDom ... no is not equals");
        const index = findIndexInParentElement(originalVirtualDom.el,parentElement);
        destroyDom(originalVirtualDom);
        mountDom(patchVirtualDom,parentElement,index);
        return patchVirtualDom
    }
    patchVirtualDom.el = originalVirtualDom.el;
    switch (patchVirtualDom.type) {
        case DOM_TYPES.TEXT:
            console.log("patchDom ... try patching text");
            return patchText(originalVirtualDom,patchVirtualDom)
        case DOM_TYPES.ELEMENT:
            console.log("patchDom ... try patching elements");
            patchElement(originalVirtualDom,patchVirtualDom);
            break
    }
    console.log("patchDom ... try patching children");
    patchChildren(originalVirtualDom,patchVirtualDom);
    return patchVirtualDom
}
function findIndexInParentElement(el,parentEl){
    const index = Array.from(parentEl.childNodes).indexOf(el);
    if(index < 0){
        return null
    }
    return index
}
function patchText(originVdom,patchVdom){
    const originText = originVdom.value;
    const targetText = patchVdom.value;
    if(originText === targetText){
        return patchVdom
    }
    patchVdom.el.nodeValue = targetText;
    return patchVdom
}
function patchElement(originVdom,patchVdom){
    const el = originVdom.el;
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
    const { listeners: originalListeners } = originVdom;
    console.log("patchElement ...");
    console.log("originStyle: ", originStyle);
    console.log("patchStyle: ", patchStyle);
    patchAttrs(el,originAttributes,patchAttributes);
    patchClasses(el,originClass,patchClass);
    patchStyles(el,originStyle,patchStyle);
    patchVdom.listeners = patchEventListeners(el,originalListeners,originEvents,patchEvents);
}
function patchAttrs(el,originAttributes,patchAttributes){
    console.log("patchAttrs ...");
    console.log("originAttributes: ", originAttributes);
    console.log("patchAttributes: ", patchAttributes);
    const {added,removed,updated} = objectsDiff(originAttributes,patchAttributes);
    console.log("added: ", added);
    console.log("removed: ", removed);
    console.log("updated: ", updated);
    for(let key of removed){
        removeAttribute(el,key);
    }
    for(let key of [...added,...updated]){
        console.log("key: ", key);
        console.log("patchAttributes[key]: ", patchAttributes[key]);
        setAttribute(el,key,patchAttributes[key]);
    }
}
function patchClasses(el,originClass,patchClass){
    const originalClassList = toClassList(originClass);
    const patchClassList = toClassList(patchClass);
    const {added,removed} = arraysDiff(originalClassList,patchClassList);
    if(added.length > 0){
        el.classList.add(...added);
    }
    if(removed.length > 0){
        el.classList.remove(...removed);
    }
}
function patchEventListeners(el,originalEventListener = {}, originEvents = {},patchEvents = {}){
    const {added,removed,updated} = objectsDiff(originEvents,patchEvents);
    console.log("patchEventListeners ...");
    console.log("added: ", added);
    console.log("removed: ", removed);
    console.log("updated: ", updated);
    console.log("originEvents: ", originEvents);
    console.log("patchEvents: ", patchEvents);
    let addEventListeners = {};
    for(let eventName of [...removed,...updated]){
        el.removeEventListener(eventName,originalEventListener[eventName]);
    }
    for(let eventName of [...added,...updated]){
        addEventListeners[eventName] = addEventListener(el,eventName,patchEvents[eventName]);
    }
    return addEventListeners
}
function patchStyles(el,originalStyles,patchStyles){
    const {added,removed,updated} = objectsDiff(originalStyles,patchStyles);
    console.log("patchStyles ...");
    console.log("added: ", added);
    console.log("removed: ", removed);
    console.log("updated: ", updated);
    for(let key of removed){
        removeStyle(el,key);
    }
    for(let key of [...added,...updated]){
        setStyle(el,key,patchStyles[key]);
    }
}
function extractChildren(vdom) {
    if (vdom.children == null) {
        return []
    }
    const children = [];
    for (const child of vdom.children) {
        if (child.type === DOM_TYPES.FRAGMENT) {
            children.push(...extractChildren(child));
        } else {
            children.push(child);
        }
    }
    return children
}
function patchChildren(originVdom,patchVdom){
    const originChildren = extractChildren(originVdom);
    const patchChildren = extractChildren(patchVdom);
    const parentEl = originVdom.el;
    const transformationSequence = generateTransformationsSequence(originChildren,patchChildren,isNodeEquals);
    for(const op of transformationSequence){
        const { originalIndex, index, item } = op;
        switch (op.operation){
            case ARRAY_DIFF_OP.ADD:
                mountDom(item,parentEl,index);
                break
            case ARRAY_DIFF_OP.MOVE:
                moveChildren(originChildren,patchChildren,parentEl,originalIndex,index);
                break
            case ARRAY_DIFF_OP.REMOVE:
                destroyDom(item);
                break
            case ARRAY_DIFF_OP.NOOP:
                patchDom(originChildren[originalIndex],patchChildren[index],parentEl);
                break
        }
    }
}
function moveChildren(originChildren,patchChildren,parentEl,originalIndex,index){
    const el = originChildren[originalIndex].el;
    const elAtTargetIndex = parentEl.childNodes[index];
    parentEl.insertBefore(el,elAtTargetIndex);
    patchDom(originChildren[originalIndex],patchChildren[index],parentEl);
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

function createApp({view,initialState,reducers = {}}){
    let _parentElement = null;
    let _virtualDom = null;
    let _state = initialState;
    let _isMounted = false;
    const dispatcher = new Dispatcher();
    const subscriptions = [dispatcher.afterEveryCommand(render)];
    const applyReducer = (actionName) => (payload) => {
        const reducer = reducers[actionName];
        if(reducer){
            _state = reducer(_state,payload);
        }
    };
    const emit = (actionName,payload) => {
        dispatcher.dispatch(actionName, payload);
    };
    for(let actionName in reducers){
        const subscription = dispatcher.subscribe(actionName,applyReducer(actionName));
        subscriptions.push(subscription);
    }
    function render(){
        const newVirtualDom = view(_state,emit);
        console.log("re-rendering...");
        patchDom(_virtualDom,newVirtualDom,_parentElement);
        _virtualDom = newVirtualDom;
    }
    return {
        mount(parentElement){
            if(_isMounted){
                return
            }
            _parentElement = parentElement;
            _virtualDom = view(_state,emit);
            mountDom(_virtualDom,_parentElement);
            _isMounted = true;
        },
        unmount(){
            if(_virtualDom){
                destroyDom(_virtualDom);
            }
            _virtualDom = null;
            subscriptions.forEach(unsubscribe => unsubscribe());
        }
    }
}

export { DOM_TYPES, createApp, destroyDom, h, hFragment, hText, mountDom };
