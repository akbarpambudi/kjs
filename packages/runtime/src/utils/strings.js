
export function isNotEmptyString(str){
    return str !== ''
}

export function isNotBlankOrEmptyString(str){
    if(str === null || str === undefined){
        return false
    }

    return isNotEmptyString(str.trim())
}