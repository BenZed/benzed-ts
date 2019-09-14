
export default function asyncSchedule(
    component: cc.Component,
    time: number
): Promise<void> {
    return new Promise(resolve => component.scheduleOnce(resolve, time))
}