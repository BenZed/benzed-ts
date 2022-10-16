
/*** Lint ***/

/* eslint-disable 
    @typescript-eslint/no-non-null-assertion,
    @typescript-eslint/no-explicit-any
*/

/*** Types ***/

interface Component<I = any, O = any> {
    (input: I): O
}

type ComponentSettings<E> = {
    [K in keyof E]: E[K]
}

type ComponentDefinition<E extends Component> = 
    (settings: ComponentSettings<E>) => (input: InputOf<E>) => OutputOf<E>

type InputOf<E extends Component> = 
    E extends Component<infer I> 
        ? I 
        : unknown

type OutputOf<E extends Component> = 
    E extends Component<any, infer O>
        ? O 
        : unknown 

/*** Main ***/

function defineComponent<I, O, S extends object>(
    def: (settings: S) => Component<I,O>
): (settings: S) => Component<I,O> & S

function defineComponent<E extends Component>(
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
