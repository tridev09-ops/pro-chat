export const getTime = (timeStamp: string) => {
    const dt = new Date(timeStamp)
    const timeStr = dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

    return timeStr
}

export const getDate = (timeStamp: string) => {
    const dt = new Date(timeStamp)
    const day = dt.getDate()
    const month = dt.getMonth()
    const year = dt.getFullYear()

    const monthArr = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
    ]
    return `${day} ${monthArr[month]} ${year}`
}