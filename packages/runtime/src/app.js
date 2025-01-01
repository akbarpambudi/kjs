import {mountDom} from './mount-dom'
import {destroyDom} from './destroy-dom'
import {Dispatcher} from "./dispatcher";
import {patchDOM} from "./patch-dom";

export function createApp({view,initialState,reducers = {}}){
    let _parentElement = null
    let _virtualDom = null
    let _state = initialState
    let _isMounted = false

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
        const newVirtualDom = view(_state,emit)
       patchDOM(_virtualDom,newVirtualDom,_parentElement)
    }

    return {
        mount(parentElement){
            if(_isMounted){
                return
            }

            _parentElement = parentElement
            _virtualDom = view(_state,emit)

            mountDom(_virtualDom,_parentElement)

            _isMounted = true
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