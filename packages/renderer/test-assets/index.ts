import path from 'path'

/*** Exports ***/

export const RENDER_FOLDER = path.resolve(__dirname, 'renders')

export const TEST_ASSETS = {
    mp4: path.join(__dirname, 'boss-media-pneumonic.mp4'),
    gif: path.join(__dirname, 'boss-media-pneumonic.gif'),
    png: path.join(__dirname, 'boss-media-logo.png'),
    jpg: path.join(__dirname, 'boss-media-logo.jpg'),
    config: path.join(__dirname, 'render-config.json'),
    badConfig: path.join(__dirname, 'render-config-bad.json'),
} as const
