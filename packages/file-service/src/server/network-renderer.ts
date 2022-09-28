import { Renderer, RendererConfig } from '@benzed/renderer'

/*** Deleegate ***/

interface NetworkRendererDelegateConfig extends RendererConfig {
    host: string
}

class NetworkRendererDelegate extends Renderer {

    public constructor (networkConfig: NetworkRendererDelegateConfig) {

        const { ...rendererConfig } = networkConfig

        super(rendererConfig)

    }

}

/***  ***/

interface NetworkRendererClientConfig extends RendererConfig {
    host: string
}

class NetworkRendererClient extends Renderer {

    public constructor (networkConfig: NetworkRendererDelegateConfig) {

        const { ...rendererConfig } = networkConfig

        super(rendererConfig)

    }

}

/*** Exports ***/

export default NetworkRendererDelegate

export {
    NetworkRendererDelegate,
    NetworkRendererClient

}