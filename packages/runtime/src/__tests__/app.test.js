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


test('app component test',()=>{
    function TodoApp(state,emit){
        return h('div', {}, [
                    h('input',{
                        type: 'text',
                        on: {
                            'change': (e)=> {
                                emit('setDraftTodo',e.target.value);
                            }
                        }
                    },),
                    h('button', {
                        id: 'add-todo',
                        on: {
                            'click': () => emit('addTodo')
                        }
                    }, [hText('add')]),
                    h('div',null,[
                        h('ul',null,state.todos.map(
                            (todo,index) => h("li",null, [
                                h('div',null,[
                                    hText(todo),
                                    h('button', {
                                        id: `up-${index}`,
                                        on: {
                                            'click': () => emit('raisePriority',index)
                                        }
                                    },[hText('up')]),
                                    h('button', {
                                        id: `remove-${index}`,
                                        on: {
                                            'click': () => emit('removeTodo',index)
                                        }
                                    },[hText('remove')])
                                ])
                            ])
                        ))
                    ])
        ])
    }

    const app = createApp({
        view: TodoApp,
        initialState: {
            draftTodo: '',
            todos: []
        },
        reducers: {
            addTodo: (state) => {
                console.log("addTodo - payload: ", state.draftTodo)
                const todos = state.todos.concat([state.draftTodo])
                return {
                    draftTodo: '',
                    todos
                }
            },
            setDraftTodo: (state,payload) =>  {
                console.log("setDraftTodo - payload: ", payload)
                return {
                    ...state,
                    draftTodo: payload,
                }
            },
            removeTodo: (state,payload) => {
                console.log("removeTodo - payload: ", payload)
                const todos = state.todos.filter((todo,index) => index !== payload)
                return {
                    ...state,
                    todos
                }
            },
            raisePriority: (state,payload) => {
                console.log("raisePriority - payload: ", payload)
                const todos = state.todos
                const todo = todos[payload]
                todos.splice(payload,1)
                todos.splice(payload - 1,0,todo)
                return {
                    ...state,
                    todos
                }
            }
        }
    })

    app.mount(document.body)

    expect(document.body.innerHTML).toBe('<div><input type="text"><button id="add-todo">add</button><div><ul></ul></div></div>')

    document.querySelector('input').value = 'hello'
    document.querySelector('input').dispatchEvent(new Event('change'))
    document.querySelector('#add-todo').click()

    expect(document.body.innerHTML).toBe('<div><input type="text"><button id="add-todo">add</button><div><ul><li><div>hello<button id="up-0">up</button><button id="remove-0">remove</button></div></li></ul></div></div>')

    document.querySelector('input').value = 'world'
    document.querySelector('input').dispatchEvent(new Event('change'))
    document.querySelector('#add-todo').click()

    expect(document.body.innerHTML).toBe('<div><input type="text"><button id="add-todo">add</button><div><ul><li><div>hello<button id="up-0">up</button><button id="remove-0">remove</button></div></li><li><div>world<button id="up-1">up</button><button id="remove-1">remove</button></div></li></ul></div></div>')

    document.querySelector('input').value = 'test'
    document.querySelector('input').dispatchEvent(new Event('change'))
    document.querySelector('#add-todo').click()

    expect(document.body.innerHTML).toBe('<div><input type="text"><button id="add-todo">add</button><div><ul><li><div>hello<button id="up-0">up</button><button id="remove-0">remove</button></div></li><li><div>world<button id="up-1">up</button><button id="remove-1">remove</button></div></li><li><div>test<button id="up-2">up</button><button id="remove-2">remove</button></div></li></ul></div></div>')

    document.querySelector('#up-2').click()

    expect(document.body.innerHTML).toBe('<div><input type="text"><button id="add-todo">add</button><div><ul><li><div>hello<button id="up-0">up</button><button id="remove-0">remove</button></div></li><li><div>test<button id="up-1">up</button><button id="remove-1">remove</button></div></li><li><div>world<button id="up-2">up</button><button id="remove-2">remove</button></div></li></ul></div></div>')

    document.querySelector('#remove-1').click()

    expect(document.body.innerHTML).toBe('<div><input type="text"><button id="add-todo">add</button><div><ul><li><div>hello<button id="up-0">up</button><button id="remove-0">remove</button></div></li><li><div>world<button id="up-1">up</button><button id="remove-1">remove</button></div></li></ul></div></div>')

    app.unmount()
    expect(document.body.innerHTML).toBe('')
})