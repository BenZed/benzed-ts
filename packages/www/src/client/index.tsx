
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type * as _ImportingContextTypesToQuietTs from 'react-router/dist/lib/context'

//// Dynamic Imports ////

const dependencies = Promise.all([
    import('react'),
    import('react-dom/client'),
    import('react-router-dom'),
    import('./components'),
    import('./routes')
] as const)

//// Data ////

const HTML_MAIN_TAG = 'benzed-www'

//// Execute ////

window.onload = async function () {

    const [
        React,
        { createRoot },
        { createBrowserRouter },
        { Website },
        { default: routes }
    ] = await dependencies

    const mainTag = document.getElementById(HTML_MAIN_TAG)
    if (!mainTag)
        throw new Error(`HTML main tag ${HTML_MAIN_TAG} not found.`)

    const browserRouter = createBrowserRouter(routes)

    const root = createRoot(mainTag)
    root.render(
        <React.StrictMode>
            <Website router={browserRouter} />
        </React.StrictMode>
    )
}