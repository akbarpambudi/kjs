import {vitest,test,expect} from "vitest";
import {Dispatcher} from "../dispatcher";

test('should not error when no handlers are registered', () => {
    const dispatcher = new Dispatcher()
    dispatcher.dispatch('foo', 'bar')
})

test('should dispatch command to all handlers', () => {
    const dispatcher = new Dispatcher()
    const handlerOne = vitest.fn()
    const handlerTwo = vitest.fn()
    dispatcher.subscribe('foo', handlerOne)
    dispatcher.subscribe('foo', handlerTwo)

    dispatcher.dispatch('foo', 'bar')

    expect(handlerOne).toHaveBeenCalledTimes(1)
    expect(handlerOne).toHaveBeenCalledWith('bar')
    expect(handlerTwo).toHaveBeenCalledTimes(1)
    expect(handlerTwo).toHaveBeenCalledWith('bar')
})

test('should not dispatch command to handlers of other commands', () => {
    const dispatcher = new Dispatcher()
    const handlerOne = vitest.fn()
    const handlerTwo = vitest.fn()
    dispatcher.subscribe('foo', handlerOne)
    dispatcher.subscribe('baz', handlerTwo)

    dispatcher.dispatch('foo', 'bar')

    expect(handlerOne).toHaveBeenCalledTimes(1)
    expect(handlerOne).toHaveBeenCalledWith('bar')
    expect(handlerTwo).not.toHaveBeenCalled()
})

test('should call afterEveryCommand handlers after every command and call command handler on a registered command only', () => {
    const dispatcher = new Dispatcher()
    const afterHandlerOne = vitest.fn()
    const afterHandlerTwo = vitest.fn()
    const handlerOne = vitest.fn()
    const handlerTwo = vitest.fn()

    dispatcher.subscribe('foo', handlerOne)
    dispatcher.subscribe('baz', handlerTwo)
    dispatcher.afterEveryCommand(afterHandlerOne)
    dispatcher.afterEveryCommand(afterHandlerTwo)

    dispatcher.dispatch('foo', 'bar')
    dispatcher.dispatch('baz', 'qux')

    expect(afterHandlerOne).toHaveBeenCalledTimes(2)
    expect(afterHandlerOne).toHaveBeenCalledWith('foo', 'bar')
    expect(afterHandlerOne).toHaveBeenCalledWith('baz', 'qux')
    expect(afterHandlerTwo).toHaveBeenCalledTimes(2)
    expect(afterHandlerTwo).toHaveBeenCalledWith('foo', 'bar')
    expect(afterHandlerTwo).toHaveBeenCalledWith('baz', 'qux')

    expect(handlerOne).toHaveBeenCalledTimes(1)
    expect(handlerOne).toHaveBeenCalledWith('bar')
    expect(handlerTwo).toHaveBeenCalledTimes(1)
    expect(handlerTwo).toHaveBeenCalledWith('qux')
})

test('should call afterEveryCommand handlers event if there are no handlers for a command', () => {
    const dispatcher = new Dispatcher()
    const afterHandlerOne = vitest.fn()
    const afterHandlerTwo = vitest.fn()

    dispatcher.afterEveryCommand(afterHandlerOne)
    dispatcher.afterEveryCommand(afterHandlerTwo)

    dispatcher.dispatch('foo', 'bar')

    expect(afterHandlerOne).toHaveBeenCalledTimes(1)
    expect(afterHandlerOne).toHaveBeenCalledWith('foo', 'bar')

    expect(afterHandlerTwo).toHaveBeenCalledTimes(1)
    expect(afterHandlerTwo).toHaveBeenCalledWith('foo', 'bar')
})

test('should unsubscribe a handler', () => {
    const dispatcher = new Dispatcher()
    const handlerOne = vitest.fn()
    const handlerTwo = vitest.fn()
    const unsubscribeOne = dispatcher.subscribe('foo', handlerOne)
    dispatcher.subscribe('foo', handlerTwo)

    dispatcher.dispatch('foo', 'bar')

    expect(handlerOne).toHaveBeenCalledTimes(1)
    expect(handlerOne).toHaveBeenCalledWith('bar')
    expect(handlerTwo).toHaveBeenCalledTimes(1)
    expect(handlerTwo).toHaveBeenCalledWith('bar')

    unsubscribeOne()

    dispatcher.dispatch('foo', 'bar')

    expect(handlerOne).toHaveBeenCalledTimes(1)
    expect(handlerTwo).toHaveBeenCalledTimes(2)
})

test('should unsubscribe an afterEveryCommand handler', () => {
    const dispatcher = new Dispatcher()
    const afterHandlerOne = vitest.fn()
    const afterHandlerTwo = vitest.fn()
    const unsubscribeOne = dispatcher.afterEveryCommand(afterHandlerOne)
    dispatcher.afterEveryCommand(afterHandlerTwo)

    dispatcher.dispatch('foo', 'bar')

    expect(afterHandlerOne).toHaveBeenCalledTimes(1)
    expect(afterHandlerOne).toHaveBeenCalledWith('foo', 'bar')
    expect(afterHandlerTwo).toHaveBeenCalledTimes(1)
    expect(afterHandlerTwo).toHaveBeenCalledWith('foo', 'bar')

    unsubscribeOne()

    dispatcher.dispatch('foo', 'bar')

    expect(afterHandlerOne).toHaveBeenCalledTimes(1)
    expect(afterHandlerTwo).toHaveBeenCalledTimes(2)
})

test('should do nothing if a handler is unsubscribed multiple times', () => {
    const dispatcher = new Dispatcher()
    const handler = vitest.fn()
    const unsubscribe = dispatcher.subscribe('foo', handler)
    unsubscribe()
    unsubscribe()

    dispatcher.dispatch('foo', 'bar')

    expect(handler).not.toHaveBeenCalled()
})

test('should do nothing if a same handler is registered multiple times', () => {
    const dispatcher = new Dispatcher()
    const handler = vitest.fn()
    dispatcher.subscribe('foo', handler)
    dispatcher.subscribe('foo', handler)

    dispatcher.dispatch('foo', 'bar')

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith('bar')
})

test('should not error if second registration of a handler is unsubscribed', () => {
    const dispatcher = new Dispatcher()
    const handler = vitest.fn()
    dispatcher.subscribe('foo', handler)
    const unsubscribe = dispatcher.subscribe('foo', handler)
    unsubscribe()

    dispatcher.dispatch('foo', 'bar')
    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith('bar')
})