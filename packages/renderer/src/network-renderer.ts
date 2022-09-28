import { Writable } from 'stream'
import { RendererConfig } from './render-settings'
import Renderer, { AddRenderItemOptions, RenderItem, RenderTask } from './renderer'

/*** Settings ***/

interface NetworkRendererConfig extends RendererConfig {
    master: boolean
}

/*** Main ***/

class NetworkRenderer extends Renderer {

    public constructor (networkConfig: NetworkRendererConfig) {

        const { master, ...rendererConfig } = networkConfig
        super(rendererConfig)

    }



/*** Exports ***/

export default NetworkRenderer

export {
    NetworkRenderer
}