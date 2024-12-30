import { beforeEach, expect, test,vi } from 'vitest'
import { destroyDom } from '../destroy-dom'
import {h,hText } from '../h'
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


function allElementsHaveBeenDestroyed(vdom) {
    if (vdom.el) {
        return false
    }

    return vdom.children?.every(allElementsHaveBeenDestroyed) ?? true
}