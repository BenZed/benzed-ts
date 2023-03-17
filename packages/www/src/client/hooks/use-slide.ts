import { useClient } from './use-client'
import { useTempStateSync } from './use-temp-state-sync'

////  ////

export const useSlide = () => {

    const client = useClient()

    const [ slide, setSlide ] = useTempStateSync(
        client.slide.get,
        client.slide.value,
        undefined
    )

    const setSlideAsync = (slide: number) => {
        client.slide.set(slide)
        setSlide(slide)
    }

    return [ slide, setSlideAsync ] as const
}