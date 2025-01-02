export function objectsDiff(obj1, obj2) {

    const added = []
    const removed = []
    const updated = []

    obj1 = obj1 || {}
    obj2 = obj2 || {}

    const obj1Keys = Object.keys(obj1)
    const obj2Keys = Object.keys(obj2)
    const obj1KeysSet = new Set(obj1Keys)
    const obj2KeysSet = new Set(obj2Keys)

    for (const key of obj1Keys) {
        if (!obj2KeysSet.has(key)) {
            removed.push(key)
        } else if (obj1[key] !== obj2[key]) {
            updated.push(key)
        }
    }

    for (const key of obj2Keys) {
        if (!obj1KeysSet.has(key)) {
            added.push(key)
        }
    }

    return {added, removed, updated}
}

export function arraysDiff(arr1, arr2) {
    const removed = []
    const added = []

    const countFreqArr1 = {}
    const countFreqArr2 = {}
    const arrMap = {}

    for (const item of arr1) {
        countFreqArr1[item] = (countFreqArr1[item] || 0) + 1
        arrMap[item] = item
    }

    for (const item of arr2) {
        countFreqArr2[item] = (countFreqArr2[item] || 0) + 1
        arrMap[item] = item
    }

    const keysSet = new Set(Object.keys(arrMap))
    for (const key of keysSet) {
        const freq1 = countFreqArr1[key] || 0
        const freq2 = countFreqArr2[key] || 0

        const diff = freq1 - freq2
        if (diff !== 0){
            if (diff > 0) {
                for (let i = 0; i < diff; i++) {
                    removed.push(arrMap[key])
                }
            } else {
                const d = -1 * diff
                for (let i = 0; i < d; i++) {
                    added.push(arrMap[key])
                }
            }
        }
    }
    return {removed, added}
}


