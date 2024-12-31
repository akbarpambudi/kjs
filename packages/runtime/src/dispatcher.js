export class Dispatcher {
    constructor(){
        this._subs = new Map();
        this._afterEveryCommandHandlers = [];
    }

    subscribe(command,handler) {
        if (!this._subs.has(command)) {
            this._subs.set(command,[])
        }
        const handlers = this._subs.get(command)
        if(handlers.includes(handler)){
            return ()=>{}
        }

        handlers.push(handler)

        return ()=>{
            const idx = this._subs.get(command).indexOf(handler)
            handlers.splice(idx,1)
        }
    }

    afterEveryCommand(handler){
        this._afterEveryCommandHandlers.push(handler)

        return ()=>{
            const idx = this._afterEveryCommandHandlers.indexOf(handler)
            this._afterEveryCommandHandlers.splice(idx,1)
        }
    }

    dispatch(command,payload){
        if (this._subs.has(command)) {
            const handlers = this._subs.get(command)
            handlers.forEach(handler => handler(payload))
        } else {
            console.warn(`No handlers for command: ${command}`)
        }


        const afterEveryCommandHandlers = this._afterEveryCommandHandlers
        afterEveryCommandHandlers.forEach(handler => handler(command,payload))
    }


}