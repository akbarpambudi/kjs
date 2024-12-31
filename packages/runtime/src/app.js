import {mountDom} from './mount-dom'
import {destroyDom} from './destroy-dom'
import {Dispatcher} from "./dispatcher";

export function createApp({view,initialState,reducers = {}}){
    let _parentElement = null
    let _virtualDom = null
    let _state = initialState

    const dispatcher = new Dispatcher()
    const subscriptions = [dispatcher.afterEveryCommand(render)]

    const applyReducer = (actionName) => (payload) => {
        const reducer = reducers[actionName]
        if(reducer){
            _state = reducer(_state,payload)
        }
    }

    const emit = (actionName,payload) => {
        dispatcher.dispatch(actionName, payload)
    }

    for(let actionName in reducers){
        const subscription = dispatcher.subscribe(actionName,applyReducer(actionName))

        subscriptions.push(subscription)
    }


    function render(){
        if(_virtualDom){
            destroyDom(_virtualDom)
        }
        _virtualDom = view(_state,emit)
        mountDom(_virtualDom,_parentElement)
    }

    return {
        mount(parentElement){
            _parentElement = parentElement
            render()
        },
        unmount(){
            if(_virtualDom){
                destroyDom(_virtualDom)
            }
            _virtualDom = null
            subscriptions.forEach(unsubscribe => unsubscribe())
        }
    }
}