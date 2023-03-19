import { useClient } from './use-client'
import { useTempStateSync } from './use-temp-state-sync'

//// Main ////

export const useSlide = () => {

    const client = useClient()

    const [ current, setCurrent ] = useTempStateSync(
        client.presentation.getCurrentSlide,
        client.presentation.currentSlide,
        undefined
    )
    
    const [ slides ] = useTempStateSync(
        client.presentation.getSlides,
        [],
        undefined
    )

    const setCurrentSlide = (slide: number) => {
        client.presentation.setCurrentSlide(slide)
        setCurrent(slide)
    }

    return [ slides[current], current, setCurrentSlide ] as const
}