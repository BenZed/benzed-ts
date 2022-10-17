
/*** Lint ***/

/* eslint-disable 
    @typescript-eslint/no-non-null-assertion,
    @typescript-eslint/no-explicit-any
*/

/*** Types ***/

interface Component<I = unknown, O = unknown> {
    (input: I): O
}

type ComponentSettings<C extends Component<any,any>> = {
    [K in keyof C]: C[K]
}

type ComponentDefinition<C extends Component<any,any>> = 
    (settings: ComponentSettings<C>) => (input: InputOf<C>) => OutputOf<C>

type InputOf<C extends Component<any,any>> = 
    C extends Component<infer I, any> 
        ? I 
        : unknown

type OutputOf<C extends Component<any,any>> = 
    C extends Component<any, infer O>
        ? O 
        : unknown 

/*** Main ***/

function defineComponent<I, O, S extends object>(
    def: (settings: S) => Component<I,O>
): (settings: S) => Component<I,O> & S

function defineComponent<E extends Component<any>>(
    def: ComponentDefinition<E>
): (settings: ComponentSettings<E>) => E 

function defineComponent(def: any): any {
    return (settings: any) => {

        const component = def(settings)
        for (const key in settings)
            (component as any)[key] = settings[key]

        return component
    }
}

/*** Exports ***/

export default defineComponent

export {
    defineComponent,

    Component,
    InputOf,
    OutputOf
}
