import {generateTransformationsSequence, ARRAY_DIFF_OP} from "../../utils/array-transformations";
import {expect, it,test, describe} from "vitest";

describe('generateTransformationsSequence', () => {
    it('equal arrays', () => {
        const oldArray = [1, 2, 3]
        const newArray = [1, 2, 3]

        const diffSeq = generateTransformationsSequence(oldArray, newArray)

        expect(diffSeq).toEqual([
            {
                operation: ARRAY_DIFF_OP.NOOP,
                originalIndex: 0,
                index: 0,
                item: 1,
            },
            {
                operation: ARRAY_DIFF_OP.NOOP,
                originalIndex: 1,
                index: 1,
                item: 2,
            },
            {
                operation: ARRAY_DIFF_OP.NOOP,
                originalIndex: 2,
                index: 2,
                item: 3,
            },
        ])

    })

    it('item removed from the beginning', () => {
        const oldArray = ['a', 'b', 'c']
        const newArray = ['b', 'c']

        const diffSeq = generateTransformationsSequence(oldArray, newArray)

        expect(diffSeq).toEqual([
            {operation: ARRAY_DIFF_OP.REMOVE, index: 0, item: 'a'},
            {operation: ARRAY_DIFF_OP.NOOP, originalIndex: 1, index: 0, item: 'b'},
            {operation: ARRAY_DIFF_OP.NOOP, originalIndex: 2, index: 1, item: 'c'},
        ])

    })

    it('item removed from the end', () => {
        const oldArray = ['a', 'b', 'c']
        const newArray = ['a', 'b']

        const diffSeq = generateTransformationsSequence(oldArray, newArray)

        expect(diffSeq).toEqual([
            {operation: ARRAY_DIFF_OP.NOOP, originalIndex: 0, index: 0, item: 'a'},
            {operation: ARRAY_DIFF_OP.NOOP, originalIndex: 1, index: 1, item: 'b'},
            {operation: ARRAY_DIFF_OP.REMOVE, index: 2, item: 'c'},
        ])
    })

    it('item removed from the middle', () => {
        const oldArray = ['a', 'b', 'c']
        const newArray = ['a', 'c']

        const diffSeq = generateTransformationsSequence(oldArray, newArray)

        expect(diffSeq).toEqual([
            {operation: ARRAY_DIFF_OP.NOOP, originalIndex: 0, index: 0, item: 'a'},
            {operation: ARRAY_DIFF_OP.REMOVE, item: 'b', index: 1},
            {operation: ARRAY_DIFF_OP.NOOP, originalIndex: 2, index: 1, item: 'c'},
        ])
    })

    it('item added at the beginning', () => {
        const oldArray = ['b', 'c']
        const newArray = ['a', 'b', 'c']

        const diffSeq = generateTransformationsSequence(oldArray, newArray)

        expect(diffSeq).toEqual([
            {operation: ARRAY_DIFF_OP.ADD, item: 'a', index: 0},
            {operation: ARRAY_DIFF_OP.NOOP, originalIndex: 0, index: 1, item: 'b'},
            {operation: ARRAY_DIFF_OP.NOOP, originalIndex: 1, index: 2, item: 'c'},
        ])

    })

    it('item added at the end', () => {
        const oldArray = ['a', 'b']
        const newArray = ['a', 'b', 'c']

        const diffSeq = generateTransformationsSequence(oldArray, newArray)

        expect(diffSeq).toEqual([
            {operation: ARRAY_DIFF_OP.NOOP, originalIndex: 0, index: 0, item: 'a'},
            {operation: ARRAY_DIFF_OP.NOOP, originalIndex: 1, index: 1, item: 'b'},
            {operation: ARRAY_DIFF_OP.ADD, item: 'c', index: 2},
        ])

    })

    it('item added at the middle', () => {
        const oldArray = ['a', 'c']
        const newArray = ['a', 'b', 'c']

        const diffSeq = generateTransformationsSequence(oldArray, newArray)

        expect(diffSeq).toEqual([
            {operation: ARRAY_DIFF_OP.NOOP, originalIndex: 0, index: 0, item: 'a'},
            {operation: ARRAY_DIFF_OP.ADD, item: 'b', index: 1},
            {operation: ARRAY_DIFF_OP.NOOP, originalIndex: 1, index: 2, item: 'c'},
        ])

    })

    it('item added in the middle of two equal elements', () => {
        const oldArray = ['a', 'a']
        const newArray = ['a', 'b', 'a']

        const diffSeq = generateTransformationsSequence(oldArray, newArray)

        expect(diffSeq).toEqual([
            {operation: ARRAY_DIFF_OP.NOOP, originalIndex: 0, index: 0, item: 'a'},
            {operation: ARRAY_DIFF_OP.ADD, item: 'b', index: 1},
            {operation: ARRAY_DIFF_OP.NOOP, originalIndex: 1, index: 2, item: 'a'},
        ])

    })

    it('item removed from two equal elements (the second is removed)', () => {
        const oldArray = ['b', 'b']
        const newArray = ['b']

        const diffSeq = generateTransformationsSequence(oldArray, newArray)

        expect(diffSeq).toEqual([
            {operation: ARRAY_DIFF_OP.NOOP, originalIndex: 0, index: 0, item: 'b'},
            {operation: ARRAY_DIFF_OP.REMOVE, item: 'b', index: 1},
        ])

    })

    it('item removed and new one added in the same place', () => {
        const oldArray = ['a', 'b', 'c']
        const newArray = ['a', 'd', 'c']

        const diffSeq = generateTransformationsSequence(oldArray, newArray)

        expect(diffSeq).toEqual([
            {operation: ARRAY_DIFF_OP.NOOP, originalIndex: 0, index: 0, item: 'a'},
            {operation: ARRAY_DIFF_OP.REMOVE, item: 'b', index: 1},
            {operation: ARRAY_DIFF_OP.ADD, item: 'd', index: 1},
            {operation: ARRAY_DIFF_OP.NOOP, originalIndex: 2, index: 2, item: 'c'},
        ])

    })

    it('two middle items replaced', () => {
        const oldArray = ['a', 'b', 'c', 'd']
        const newArray = ['a', 'X', 'Y', 'd']

        const diffSeq = generateTransformationsSequence(oldArray, newArray)

        expect(diffSeq).toEqual([
            {operation: ARRAY_DIFF_OP.NOOP, originalIndex: 0, index: 0, item: 'a'},
            {operation: ARRAY_DIFF_OP.REMOVE, item: 'b', index: 1},
            {operation: ARRAY_DIFF_OP.REMOVE, item: 'c', index: 1},
            {operation: ARRAY_DIFF_OP.ADD, item: 'X', index: 1},
            {operation: ARRAY_DIFF_OP.ADD, item: 'Y', index: 2},
            {operation: ARRAY_DIFF_OP.NOOP, originalIndex: 3, index: 3, item: 'd'},
        ])

    })

    it('two items moved', () => {
        const oldArray = ['a', 'b', 'c']
        const newArray = ['b', 'a', 'c']

        const diffSeq = generateTransformationsSequence(oldArray, newArray)

        expect(diffSeq).toEqual([
            {
                operation: ARRAY_DIFF_OP.MOVE,
                originalIndex: 1,
                from: 1,
                index: 0,
                item: 'b',
            },
            {operation: ARRAY_DIFF_OP.NOOP, originalIndex: 0, index: 1, item: 'a'},
            {operation: ARRAY_DIFF_OP.NOOP, originalIndex: 2, index: 2, item: 'c'},
        ])

    })

    it('remove, add and move', () => {
        const oldArray = ['a', 'b', 'c', 'd']
        const newArray = ['b', 'X', 'd', 'c']

        const diffSeq = generateTransformationsSequence(oldArray, newArray)

        expect(diffSeq).toEqual([
            {operation: ARRAY_DIFF_OP.REMOVE, item: 'a', index: 0},
            {operation: ARRAY_DIFF_OP.NOOP, originalIndex: 1, index: 0, item: 'b'},
            {operation: ARRAY_DIFF_OP.ADD, item: 'X', index: 1},
            {
                operation: ARRAY_DIFF_OP.MOVE,
                item: 'd',
                originalIndex: 3,
                from: 3,
                index: 2,
            },
            {operation: ARRAY_DIFF_OP.NOOP, originalIndex: 2, index: 3, item: 'c'},
        ])

    })

    it('remove repeated element, add and move', () => {
        const oldArray = ['a', 'a', 'b', 'c']
        const newArray = ['c', 'k', 'a', 'b']

        const diffSeq = generateTransformationsSequence(oldArray, newArray)
        expect(diffSeq).toEqual([
            {
                operation: ARRAY_DIFF_OP.MOVE,
                originalIndex: 3,
                from: 3,
                index: 0,
                item: 'c',
            },
            {operation: ARRAY_DIFF_OP.ADD, index: 1, item: 'k'},
            {operation: ARRAY_DIFF_OP.NOOP, originalIndex: 0, index: 2, item: 'a'},
            {
                operation: ARRAY_DIFF_OP.MOVE,
                originalIndex: 2,
                from: 4,
                index: 3,
                item: 'b',
            },
            {operation: ARRAY_DIFF_OP.REMOVE, index: 4, item: 'a'},
        ])
    })

    test.each([
        {
            oldArray: ['a', 'b', 'c'],
            newArray: ['c', 'a', 'b'],
            expected: [
                {
                    operation: ARRAY_DIFF_OP.MOVE,
                    item: 'c',
                    originalIndex: 2,
                    from: 2,
                    index: 0,
                },
                {operation: ARRAY_DIFF_OP.NOOP, originalIndex: 0, index: 1, item: 'a'},
                {operation: ARRAY_DIFF_OP.NOOP, originalIndex: 1, index: 2, item: 'b'},
            ],
        },
        {
            oldArray: ['a', 'b', 'c'],
            newArray: ['b', 'c', 'a'],
            expected: [
                {
                    operation: ARRAY_DIFF_OP.MOVE,
                    item: 'b',
                    originalIndex: 1,
                    from: 1,
                    index: 0,
                },
                {
                    operation: ARRAY_DIFF_OP.MOVE,
                    item: 'c',
                    originalIndex: 2,
                    from: 2,
                    index: 1,
                },
                {operation: ARRAY_DIFF_OP.NOOP, originalIndex: 0, index: 2, item: 'a'},
            ],
        },
        {
            oldArray: ['a', 'b', 'c', 'd'],
            newArray: ['c', 'a', 'b', 'd'],
            expected: [
                {
                    operation: ARRAY_DIFF_OP.MOVE,
                    item: 'c',
                    originalIndex: 2,
                    from: 2,
                    index: 0,
                },
                {operation: ARRAY_DIFF_OP.NOOP, originalIndex: 0, index: 1, item: 'a'},
                {operation: ARRAY_DIFF_OP.NOOP, originalIndex: 1, index: 2, item: 'b'},
                {operation: ARRAY_DIFF_OP.NOOP, originalIndex: 3, index: 3, item: 'd'},
            ],
        },
    ])(
        'find moves and noops, from $oldArray to $newArray',
        ({oldArray, newArray, expected}) => {
            const diffSeq = generateTransformationsSequence(oldArray, newArray)

            expect(diffSeq).toEqual(expected)

        }
    )
})