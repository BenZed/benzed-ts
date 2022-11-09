import Component, { Components } from './component'

//// Main ////

class Entity<C extends Components> extends Component {

    static create(): Entity<[]> {
        return new Entity(null, [])
    }

    private constructor(
        parent: Component | null,
        readonly components: C
    ) {
        super(parent)
    }

}

/*** Export ***/

export default Entity

export {
    Entity
}