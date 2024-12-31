import {expect,beforeEach,test} from "vitest";
import {createApp} from "../app";
import {hText,h} from "../h";

beforeEach(() => {
    document.body.innerHTML = ''
})

test('should render a text element', async () => {
    const app = createApp({
        view: () => hText('hello'),
        initialState: {}
    })

    app.mount(document.body)

    expect(document.body.innerHTML).toBe('hello')
})

test ('should render a div with p and button with initial state', async () => {
    const app = createApp({
        view: (state) => h('div', {}, [
            h('p',{},[hText(state.count)]),
            h('button', {}, [hText('click me')])
        ]),
        initialState: {
            count: 1
        }
    })

    app.mount(document.body)

    expect(document.body.innerHTML).toBe('<div><p>1</p><button>click me</button></div>')
})

test('should update the view when the state changes', async () => {
    const app = createApp({
        view: (state, emit) => h('div', {}, [
            h('p', {}, [hText(state.count)]),
            h('button', { on: { click: () => emit('increment') } }, [hText('click me')])
        ]),
        initialState: {
            count: 1
        },
        reducers: {
            increment: (state) => ({ ...state, count: state.count + 1 })
        }
    })

    app.mount(document.body)

    expect(document.body.innerHTML).toBe('<div><p>1</p><button>click me</button></div>')

    document.querySelector('button').click()

    expect(document.body.innerHTML).toBe('<div><p>2</p><button>click me</button></div>')
})

test('unmount the app', async () => {
    const app = createApp({
        view: () => hText('hello'),
        initialState: {}
    })

    app.mount(document.body)

    expect(document.body.innerHTML).toBe('hello')

    app.unmount()

    expect(document.body.innerHTML).toBe('')
})

test('unmount the app with a reducer', async () => {
    const app = createApp({
        view: (state, emit) => h('div', {}, [
            h('p', {}, [hText(state.count)]),
            h('button', { on: { click: () => emit('increment') } }, [hText('click me')])
        ]),
        initialState: {
            count: 1
        },
        reducers: {
            increment: (state) => ({ ...state, count: state.count + 1 })
        }
    })

    app.mount(document.body)

    expect(document.body.innerHTML).toBe('<div><p>1</p><button>click me</button></div>')

    document.querySelector('button').click()

    expect(document.body.innerHTML).toBe('<div><p>2</p><button>click me</button></div>')

    app.unmount()

    expect(document.body.innerHTML).toBe('')
})
