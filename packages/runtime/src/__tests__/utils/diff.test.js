import {expect,test} from "vitest";
import {objectsDiff} from "../../utils/diff";

test('should not give any diff of two objects when it is identical', () => {
    const a = { foo: 'bar', baz: 'qux' }
    const b = { foo: 'bar', baz: 'qux' }

    const diff = objectsDiff(a, b)

    expect(diff).toEqual({ added: [], removed: [], updated: [] })
})

test('should give the diff of two objects', () => {
    const a = { foo: 'bar', baz: 'qux' }
    const b = { foo: 'bar', baz: 'quux' }

    const diff = objectsDiff(a, b)

    expect(diff).toEqual({ added: [], removed: [], updated: ['baz'] })
})

test('should give the diff of two objects with added properties', () => {
    const a = { foo: 'bar' }
    const b = { foo: 'bar', baz: 'qux' }

    const diff = objectsDiff(a, b)

    expect(diff).toEqual({ added: ['baz'], removed: [], updated: [] })
})

test('should give the diff of two objects with removed properties', () => {
    const a = { foo: 'bar', baz: 'qux' }
    const b = { foo: 'bar' }

    const diff = objectsDiff(a, b)

    expect(diff).toEqual({ added: [], removed: ['baz'], updated: [] })
})

test('should give the diff of two objects with added, removed and updated properties', () => {
    const a = { foo: 'bar', baz: 'qux' }
    const b = { baz: 'quux', qux: 'quux' }

    const diff = objectsDiff(a, b)

    expect(diff).toEqual({ added: ['qux'], removed: ['foo'], updated: ['baz'] })
})

test('same object, no change', () => {
    const oldObj = { foo: 'bar' }
    const newObj = { foo: 'bar' }
    const { added, removed, updated } = objectsDiff(oldObj, newObj)

    expect(added).toEqual([])
    expect(removed).toEqual([])
    expect(updated).toEqual([])
})

test('add key', () => {
    const oldObj = {}
    const newObj = { foo: 'bar' }
    const { added, removed, updated } = objectsDiff(oldObj, newObj)

    expect(added).toEqual(['foo'])
    expect(removed).toEqual([])
    expect(updated).toEqual([])
})

test('remove key', () => {
    const oldObj = { foo: 'bar' }
    const newObj = {}
    const { added, removed, updated } = objectsDiff(oldObj, newObj)

    expect(added).toEqual([])
    expect(removed).toEqual(['foo'])
    expect(updated).toEqual([])
})

test('update value', () => {
    const arr = [1, 2, 3]
    const oldObj = { foo: 'bar', arr }
    const newObj = { foo: 'baz', arr }
    const { added, removed, updated } = objectsDiff(oldObj, newObj)

    expect(added).toEqual([])
    expect(removed).toEqual([])
    expect(updated).toEqual(['foo'])
})