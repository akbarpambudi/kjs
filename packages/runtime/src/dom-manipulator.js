

export function addEventListeners(eventListeners,el){
    const addedEventListeners = {}

    if(!eventListeners) {
        return addedEventListeners
    }

    Object.entries(eventListeners).forEach(([eventName,handler]) => {
        addedEventListeners[eventName] = addEventListener(el,eventName,handler)
    })

    return addedEventListeners
}

export function addEventListener(el,eventName,handler){
    el.addEventListener(eventName,handler)

    return handler
}


export function setAttributes(el,attrs) {
    const {style,'class':className,...rest} = attrs

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

export function setClass(el,className) {
    el.className = ''

    if (typeof className === 'string') {
        el.className = className
    }

    if (Array.isArray(className)) {
        el.classList.add(...className)
    }
}

export function setStyle(el,key,value) {
    console.log("setStyle ...")
    console.log("key: ", key)
    el.style[key] = value
}

export function removeStyle(el,key){
    el.style[key] = null
}


export function setAttribute(el,key,value) {
    if(value === null || value === undefined) {
        removeAttribute(el,key)
    } else if (key.startsWith('data-')){
        el.setAttribute(key,value)
    } else {
        el[key] = value
    }
}

export function removeAttribute(el,key) {
    el[key] = null
    el.removeAttribute(key)
}
