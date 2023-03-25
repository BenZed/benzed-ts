import { PresentationState } from '../../app/presentation'
import { useClient } from './use-client'
import { useTempStateSync } from './use-temp-state-sync'

//// Main ////

export const usePresentation = () => {

    const client = useClient()

    const [ current, setCurrentLocal ] = useTempStateSync(
        client.presentation.getCurrent,
        client.presentation.current,
        undefined,
        500
    )

    const [ slides ] = useTempStateSync(
        client.presentation.getSlides,
        [],
        undefined,
        2500
    )

    const setCurrent = async (slideState: PresentationState) => {
        await client.presentation.setCurrent(slideState)
        setCurrentLocal(slideState)
    }

    return [
        slides,
        current, 
        setCurrent 
    ] as const
}