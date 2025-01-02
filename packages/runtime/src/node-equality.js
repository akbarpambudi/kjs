import {DOM_TYPES} from "./h";

export function isNodeEquals(node1,node2){
    if(node1.type !== node2.type){
        return false
    }

    if(node1.type === DOM_TYPES.ELEMENT){
        return node1.tag === node2.tag
    }

    return true
}