
//// Data ////

const HTML_MAIN_TAG = 'benzed-www'

/* Dynamic Imports for webpack output chunking */

const dependencies = Promise.all([
    import('react'),
    import('react-dom/client'),
    import('react-router-dom'),
    import('./components'),
] as const)

/* Execute */

window.onload = async function () {

    const [
        React,
        { createRoot },
        { BrowserRouter },
        { Website }
    ] = await dependencies

    const mainTag = document.getElementById(HTML_MAIN_TAG)
    if (!mainTag)
        throw new Error(`HTML main tag ${HTML_MAIN_TAG} not found.`)

    const root = createRoot(mainTag)
    root.render(
        <React.StrictMode>
            <BrowserRouter>
                <Website />
            </BrowserRouter>
        </React.StrictMode>
    )
}