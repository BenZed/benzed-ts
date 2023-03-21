import { useClient } from './use-client'
import { useTempStateSync } from './use-temp-state-sync'

//// Main ////

export const useSlides = () => {

    const client = useClient()

    const [ currentSlide, _setCurrentSlide ] = useTempStateSync(
        client.presentation.getCurrentSlide,
        client.presentation.currentSlide,
        undefined,
        500
    )
    
    const [ slides ] = useTempStateSync(
        client.presentation.getSlides,
        [],
        undefined,
        10000
    )

    const setCurrentSlide = async (slide: number) => {
        if (slide < 0)
            return 

        await client.presentation.setCurrentSlide(slide)
        _setCurrentSlide(slide)
    }

    return [ 
        slides, 
        currentSlide, 
        setCurrentSlide 
    ] as const
}