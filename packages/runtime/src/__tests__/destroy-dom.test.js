import { beforeEach, expect, test,vi } from 'vitest'
import { destroyDom } from '../destroy-dom'
import {h,hText,hFragment } from '../h'
import { mountDom } from '../mount-dom'

beforeEach(() => {
    document.body.innerHTML = ''
})

test('destroy a text element', async () => {
    const vdom = hText('hello')

    await mountDom(vdom, document.body)
    expect(document.body.innerHTML).toBe('hello')
    expect(vdom.el).toBeInstanceOf(Text)

    await destroyDom(vdom)
    expect(document.body.innerHTML).toBe('')
    expect(allElementsHaveBeenDestroyed(vdom)).toBe(true)
})

test('destroy an html element and its children', async () => {
    const vdom = h('div', {}, [hText('hello')])

    await mountDom(vdom, document.body)
    expect(document.body.innerHTML).toBe('<div>hello</div>')
    expect(vdom.el).toBeInstanceOf(HTMLDivElement)

    await destroyDom(vdom)
    expect(document.body.innerHTML).toBe('')
    expect(allElementsHaveBeenDestroyed(vdom)).toBe(true)
})

test('remove an html element event listeners', async () => {
    const handler = vi.fn()
    const vdom = h('button', { on: { click: handler } }, [hText('hello')])

    await mountDom(vdom, document.body)
    const buttonEl = vdom.el
    buttonEl.click()

    expect(handler).toHaveBeenCalledTimes(1)

    await destroyDom(vdom)
    buttonEl.click()

    expect(handler).toHaveBeenCalledTimes(1)
})

test('destroy an html element and its children recursively', async () => {
    const vdom = h('div', {}, [
        h('p', {}, [hText('hello')]),
        h('span', {}, [hText('world')]),
    ])

    await mountDom(vdom, document.body)
    expect(document.body.innerHTML).toBe(
        '<div><p>hello</p><span>world</span></div>'
    )
    expect(vdom.el).toBeInstanceOf(HTMLDivElement)

    await destroyDom(vdom)
    expect(document.body.innerHTML).toBe('')
    expect(allElementsHaveBeenDestroyed(vdom)).toBe(true)
})

test('destroy a fragment', async () => {
    const vdom = hFragment([
        h('div', {}, [hText('hello')]),
        h('span', {}, [hText('world')]),
    ])

    await mountDom(vdom, document.body)
    expect(document.body.innerHTML).toBe('<div>hello</div><span>world</span>')

    await destroyDom(vdom)
    expect(document.body.innerHTML).toBe('')
    expect(allElementsHaveBeenDestroyed(vdom)).toBe(true)
})

test('destroy a fragment recursively', async () => {
    const vdom = hFragment([
        h('span', {}, ['hello']),
        hFragment([h('span', {}, [hText('world')])]),
    ])

    await mountDom(vdom, document.body)
    expect(document.body.innerHTML).toBe(
        '<span>hello</span><span>world</span>'
    )

    await destroyDom(vdom)
    expect(document.body.innerHTML).toBe('')
    expect(allElementsHaveBeenDestroyed(vdom)).toBe(true)
})



function allElementsHaveBeenDestroyed(vdom) {
    if (vdom.el) {
        return false
    }

    return vdom.children?.every(allElementsHaveBeenDestroyed) ?? true
}