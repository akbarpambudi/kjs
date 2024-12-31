export function objectsDiff(obj1, obj2) {
    const added = []
    const removed = []
    const updated = []

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

