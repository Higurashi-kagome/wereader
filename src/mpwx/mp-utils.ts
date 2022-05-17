function timeConverter(UNIX_timestamp: number): string{
    const zeroPad = (num: number, places: number) => String(num).padStart(places, '0')
    var a = new Date(UNIX_timestamp * 1000)
    var year = a.getFullYear()
    var month = zeroPad(a.getMonth()+1, 2)
    var day = zeroPad(a.getDate(), 2)
    var hour = zeroPad(a.getHours(), 2)
    var min = zeroPad(a.getMinutes(), 2)
    var sec = zeroPad(a.getSeconds(), 2)
    return `${year}.${month}.${day} ${hour}:${min}`
}

export {timeConverter};