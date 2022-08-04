
/*** Types ***/

interface RendererOptions {
    previewSettings?: {
        video?: { quality: number }[]
        audio?: { quality: number }[]
        image?: { quality: number }[]
    }
}

/*** Main ***/

class Renderer {

    public readonly options: Required<RendererOptions>

    public constructor (options?: RendererOptions) {

        this.options = {
            previewSettings: {
                'video': [{ quality: 0 }],
            },
            ...options
        }

    }
}

/*** Exports ***/

export default Renderer

export {
    Renderer,
    RendererOptions
}