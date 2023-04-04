
import 'normalize.css'

//// Data ////

const HTML_MAIN_TAG = 'benzed-www'

//// Dynamic Imports ////

const dependencies = Promise.all([
    import('react'),
    import('react-dom/client'),
    import('react-router-dom'),
    import('../app'),
    import('./components'),
] as const)

//// Execute ////

window.onload = async function () {

    const [
        React,
        { createRoot },
        { BrowserRouter },
        { presenterClient },
        { Providers }
    ] = await dependencies

    const main = document.getElementById(HTML_MAIN_TAG)
    if (!main)
        throw new Error(`HTML main tag ${HTML_MAIN_TAG} not found.`)

    const root = createRoot(main)
    root.render(
        <React.StrictMode>
            <BrowserRouter>
                <Providers client={presenterClient} />
            </BrowserRouter>
        </React.StrictMode>
    )
}