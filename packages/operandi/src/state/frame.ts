
import { V2String, V2, V2Signature } from '@benzed/math'

/*** Types ***/

type FrameLink<F extends Frame> = {
    readonly type: 'parent'
} | {
    readonly type: 'child'
    readonly transaction?: (parent: F, child: Frame) => F
}

interface Frame<S extends string = string> {
    readonly type: S
}

interface FrameCoord {
    readonly coord: Readonly<V2>
}

type FrameNav<F extends Frame> = {

    readonly links: Readonly<Record<V2String, FrameLink<F>>>

    readonly navigation?: {
        routeKey: string
        spawn: (routeKey: string) => F | null
    }

}

/*** Interface ***/

type FrameWithCoord<F extends Frame> = F & FrameCoord
type FrameWithMeta<F extends Frame> = FrameWithCoord<F> & FrameNav<F>

/*** Exports ***/

export {
    Frame
}