
export const ARRAY_DIFF_OP = {
    ADD: 'add',
    REMOVE: 'remove',
    MOVE: 'move',
    NOOP: 'noop'
}

export function generateTransformationsSequence(originalArr,newArr,equalityFn = (a,b) => a === b) {
    const transformationSequence = []

    const wrappedOriginalArr = new TransformationOriginArrayWrapper(originalArr,equalityFn)
    let index = 0
    let infiniteLoopCounter = 0
    while(index < newArr.length && infiniteLoopCounter < 100000) {
        infiniteLoopCounter++
        if(wrappedOriginalArr.isRemovalOperation(newArr,index)) {
            transformationSequence.push(wrappedOriginalArr.removeItem(index))
            continue
        } else if (wrappedOriginalArr.isNoopOperation(newArr,index)) {
            transformationSequence.push(wrappedOriginalArr.noopItem(index))
        } else if (wrappedOriginalArr.isAdditionOperation(newArr,index)) {
            const item = newArr[index]
           transformationSequence.push(wrappedOriginalArr.addItem(item,index))
        } else {
            const item = newArr[index]
            transformationSequence.push(wrappedOriginalArr.moveItem(item,index))
        }

        index++
    }

    transformationSequence.push(...wrappedOriginalArr.removeItemsAfter(index))

    return transformationSequence
}

class TransformationOriginArrayWrapper {
    constructor(arr,equalityFn = (a,b) => a === b) {
        this._arr = [...arr]
        this._originalIndexes = arr.map((item, index) => index)
        this._equalityFn = equalityFn
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

        const item = this._arr[index]
        const indexInNewArr = newArr.findIndex(item2 => this._equalityFn(item,item2))

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
        }

        this._arr.splice(index,1)
        this._originalIndexes.splice(index,1)

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
        }

        this._arr.splice(index,0,item)
        this._originalIndexes.splice(index,0,-1)

        return operation
    }

    moveItem(item,toIndex){
        const fromIndex = this.findIndexStartedAt(item, toIndex)
        const operation = {
            operation: ARRAY_DIFF_OP.MOVE,
            originalIndex: this.originalIndexAt(fromIndex),
            from: fromIndex,
            index: toIndex,
            item
        }

        //use item from old array so we could ensure it maintain the same reference
        const [_item] = this._arr.splice(fromIndex,1)
        this._arr.splice(toIndex,0,_item)

        const [originalIndex] = this._originalIndexes.splice(fromIndex,1)
        this._originalIndexes.splice(toIndex,0,originalIndex)

        return operation
    }

    removeItemsAfter(index){
        const operations = []
        while (this.length > index) {
            operations.push(this.removeItem(index))
        }

        return operations
    }
}



