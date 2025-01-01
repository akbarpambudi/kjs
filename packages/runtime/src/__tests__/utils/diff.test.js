import {expect,describe,it} from "vitest";
import {arraysDiff, objectsDiff} from "../../utils/diff";

describe('objectsDiff', () => {
    it('should not give any diff of two objects when it is identical', () => {
        const a = { foo: 'bar', baz: 'qux' }
        const b = { foo: 'bar', baz: 'qux' }

        const diff = objectsDiff(a, b)

        expect(diff).toEqual({ added: [], removed: [], updated: [] })
    })

    it('should give the diff of two objects', () => {
        const a = { foo: 'bar', baz: 'qux' }
        const b = { foo: 'bar', baz: 'quux' }

        const diff = objectsDiff(a, b)

        expect(diff).toEqual({ added: [], removed: [], updated: ['baz'] })
    })

    it('should give the diff of two objects with added properties', () => {
        const a = { foo: 'bar' }
        const b = { foo: 'bar', baz: 'qux' }

        const diff = objectsDiff(a, b)

        expect(diff).toEqual({ added: ['baz'], removed: [], updated: [] })
    })

    it('should give the diff of two objects with removed properties', () => {
        const a = { foo: 'bar', baz: 'qux' }
        const b = { foo: 'bar' }

        const diff = objectsDiff(a, b)

        expect(diff).toEqual({ added: [], removed: ['baz'], updated: [] })
    })

    it('should give the diff of two objects with added, removed and updated properties', () => {
        const a = { foo: 'bar', baz: 'qux' }
        const b = { baz: 'quux', qux: 'quux' }

        const diff = objectsDiff(a, b)

        expect(diff).toEqual({ added: ['qux'], removed: ['foo'], updated: ['baz'] })
    })

    it('same object, no change', () => {
        const oldObj = { foo: 'bar' }
        const newObj = { foo: 'bar' }
        const { added, removed, updated } = objectsDiff(oldObj, newObj)

        expect(added).toEqual([])
        expect(removed).toEqual([])
        expect(updated).toEqual([])
    })

    it('add key', () => {
        const oldObj = {}
        const newObj = { foo: 'bar' }
        const { added, removed, updated } = objectsDiff(oldObj, newObj)

        expect(added).toEqual(['foo'])
        expect(removed).toEqual([])
        expect(updated).toEqual([])
    })

    it('remove key', () => {
        const oldObj = { foo: 'bar' }
        const newObj = {}
        const { added, removed, updated } = objectsDiff(oldObj, newObj)

        expect(added).toEqual([])
        expect(removed).toEqual(['foo'])
        expect(updated).toEqual([])
    })

    it('update value', () => {
        const arr = [1, 2, 3]
        const oldObj = { foo: 'bar', arr }
        const newObj = { foo: 'baz', arr }
        const { added, removed, updated } = objectsDiff(oldObj, newObj)

        expect(added).toEqual([])
        expect(removed).toEqual([])
        expect(updated).toEqual(['foo'])
    })

})


describe('arraysDiff', () => {
    it('should not give any diff of two arrays when it is identical', () => {
        const a = [1, 2, 3]
        const b = [1, 2, 3]

        const {removed,added} = arraysDiff(a, b)

        expect(removed).toEqual([])
        expect(added).toEqual([])
    })

    it('should give the diff of two arrays', () => {
        const a = [1, 2, 3]
        const b = [1, 2, 4]

        const {removed,added} = arraysDiff(a, b)

        expect(removed).toEqual([3])
        expect(added).toEqual([4])
    })

    it('should give the diff of two arrays with added elements', () => {
        const a = [1, 2, 3]
        const b = [1, 2, 3, 4]

        const {removed,added} = arraysDiff(a, b)
        expect(removed).toEqual([])
        expect(added).toEqual([4])
    })

    it('should give the diff of two arrays with removed elements', () => {
        const a = [1, 2, 3, 4]
        const b = [1, 2, 3]

        const {removed,added} = arraysDiff(a, b)
        expect(removed).toEqual([4])
        expect(added).toEqual([])
    })

    it('it should find the diff of two arrays with added, removed and updated elements when the addition is at the middle', () => {
        const a = [1, 2, 3, 4]
        const b = [1, 2, 5,3, 4]

        const {removed,added} = arraysDiff(a, b)
        expect(removed).toEqual([])
        expect(added).toEqual([5])
    })

    it('equal arrays', () => {
        const oldArray = [1, 2, 3]
        const newArray = [1, 2, 3]

        expect(arraysDiff(oldArray, newArray)).toEqual({
            added: [],
            removed: [],
        })
    })

    it('item added', () => {
        const oldArray = [1, 2, 3]
        const newArray = [1, 2, 3, 4]

        expect(arraysDiff(oldArray, newArray)).toEqual({
            added: [4],
            removed: [],
        })
    })

    it('item removed', () => {
        const oldArray = [1, 2, 3]
        const newArray = [1, 2]

        expect(arraysDiff(oldArray, newArray)).toEqual({
            added: [],
            removed: [3],
        })
    })

    it('items added and items removed', () => {
        const oldArray = [1, 2, 3]
        const newArray = [1, 2, 4, 5]

        expect(arraysDiff(oldArray, newArray)).toEqual({
            added: [4, 5],
            removed: [3],
        })
    })

    it('duplicated item where one unit is removed', () => {
        const oldArray = [1, 1]
        const newArray = [1]

        expect(arraysDiff(oldArray, newArray)).toEqual({
            added: [],
            removed: [1],
        })
    })

    it('duplicated item where two items are removed', () => {
        const oldArray = [1, 1]
        const newArray = []

        expect(arraysDiff(oldArray, newArray)).toEqual({
            added: [],
            removed: [1, 1],
        })
    })

    it('duplicated item where one unit is added', () => {
        const oldArray = [1]
        const newArray = [1, 1]

        expect(arraysDiff(oldArray, newArray)).toEqual({
            added: [1],
            removed: [],
        })
    })

    it('duplicated item where two units are added', () => {
        const oldArray = []
        const newArray = [1, 1]

        expect(arraysDiff(oldArray, newArray)).toEqual({
            added: [1, 1],
            removed: [],
        })
    })

    it('array with duplicates', () => {
        const oldArray = [1, 1, 2, 2, 3, 3, 3]
        const newArray = [1, 1, 1, 2, 3, 4, 4]

        const { added, removed } = arraysDiff(oldArray, newArray)
        added.sort()
        removed.sort()

        expect({ added, removed }).toEqual({
            added: [1, 4, 4],
            removed: [2, 3, 3],
        })
    })
})