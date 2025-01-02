import { beforeEach, expect, test, vi } from 'vitest'
import {h, hFragment, hText} from '../h'
import { mountDom } from '../mount-dom'

beforeEach(() => {
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
})

test("can't mount an element without a host element", () => {
    const vdom = h('div', {}, [hText('hello')])
    expect(() => mountDom(vdom)).toThrow()
})

test('mount a text element in a host element', () => {
    const vdom = hText('hello')
    mountDom(vdom, document.body)

    expect(document.body.innerHTML).toBe('hello')
})

test('save the created text element in the vdom', () => {
    const vdom = hText('hello')
    mountDom(vdom, document.body)
    const el = vdom.el

    expect(el).toBeInstanceOf(Text)
    expect(el.textContent).toBe('hello')
})


test('mount an element in a host element', () => {
    const vdom = h('div', {}, [hText('hello')])
    mountDom(vdom, document.body)
    expect(document.body.innerHTML).toBe('<div>hello</div>')
})

test('save the created element in the vdom', () => {
    const vdom = h('div', {}, [hText('hello')])
    mountDom(vdom, document.body)
    const el = vdom.el

    expect(el).toBeInstanceOf(HTMLDivElement)
    expect(el.textContent).toBe('hello')
})

test("can't mount a fragment without a parent element", () => {
    const vdom = hFragment([hText('hello')])
    expect(() => mountDom(vdom)).toThrow()
})

test('mount a fragment in a host element', () => {
    const vdom = hFragment([hText('hello')])
    mountDom(vdom, document.body)
    expect(document.body.innerHTML).toBe('hello')
})

test('mount a fragment in a host element with multiple child (children)', () => {
    const vdom = hFragment([hText('hello, '), hText('world')])
    mountDom(vdom, document.body)

    expect(document.body.innerHTML).toBe('hello, world')
})

test('mount a fragment inside a fragment inside a host element', () => {
    const vdom = hFragment([
        h('p', {}, ['foo']),
        hFragment([h('p', {}, ['bar']), h('p', {}, ['baz'])]),
    ])
    mountDom(vdom, document.body)

    expect(document.body.innerHTML).toBe('<p>foo</p><p>bar</p><p>baz</p>')
})

test('all nested fragments el references point to the parent element (where they are mounted)', () => {
    const vdomOne = hFragment([hText('hello, '), hText('world')])
    const vdomTwo = hFragment([vdomOne])
    const vdomThree = hFragment([vdomTwo])

    mountDom(vdomThree, document.body)

    expect(vdomThree.el).toBe(document.body)
    expect(vdomTwo.el).toBe(document.body)
    expect(vdomOne.el).toBe(document.body)
})

test('mount fragment with children that have attributes', () => {
    const vdom = hFragment([
        h('span', { id: 'foo' }, [hText('hello, ')]),
        h('span', { id: 'bar' }, [hText('world')]),
    ])

    mountDom(vdom, document.body)

    expect(document.body.innerHTML).toBe(
        '<span id="foo">hello, </span><span id="bar">world</span>'
    )
})

test('mount an element with id', () => {
    const vdom = h('div', { id: 'foo' })
    mountDom(vdom, document.body)

    expect(document.body.innerHTML).toBe('<div id="foo"></div>')
})

test('mount an element with class', () => {
    const vdom = h('div', { class: 'foo' })
    mountDom(vdom, document.body)

    expect(document.body.innerHTML).toBe('<div class="foo"></div>')
})

test('mount an element with a list of classes', () => {
    const vdom = h('div', { class: ['foo', 'bar'] })
    mountDom(vdom, document.body)

    expect(document.body.innerHTML).toBe('<div class="foo bar"></div>')
})

test('mount an element with event handlers', () => {
    const onClick = vi.fn()
    const vdom = h('div', { on: { click: onClick } })
    mountDom(vdom, document.body)

    vdom.el?.click()

    expect(onClick).toBeCalledTimes(1)
    expect(onClick).toBeCalledWith(expect.any(MouseEvent))
    expect(vdom.listeners).toEqual({ click: expect.any(Function) })
})

test('mounts an element with styles', () => {
    const vdom = h('div', { style: { color: 'red' } })
    mountDom(vdom, document.body)
    const el = vdom.el

    expect(document.body.innerHTML).toBe('<div style="color: red;"></div>')
    expect(el.style.color).toBe('red')
})

test('insert a sibling element before another element', () => {
    const vdomOne = h('div', { id: 'one' })
    const vdomTwo = h('div', { id: 'two' })

    mountDom(vdomTwo, document.body)
    mountDom(vdomOne, document.body, 0)

    expect(document.body.innerHTML).toBe('<div id="one"></div><div id="two"></div>')
})