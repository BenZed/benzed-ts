import { assign, each } from '@benzed/util'
import State from './state'

//// Main ////

/**
 * The DeepState trait assumes any enumerable properties it has
 * are sta
 */
class DeepState extends State {

    get [State.key](): object {

        const output = {} as this
        for (const [key, value] of each.entryOf(this)) {
            output[key] = State.is(value) 
                ? State.get(value) as typeof value 
                : value
        }
    
        return output
    }

    protected set [State.key](state: object) {

        for (const key of each.keyOf(state)) {
            if (State.is(this[key]))
                state[key] = State.apply(this[key], state[key])
        }

        assign(this, state)
    }

}

//// Exports ////

export default DeepState

export {
    DeepState
}