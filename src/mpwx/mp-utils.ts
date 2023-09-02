function timeConverter(UNIX_timestamp: number): string {
	const zeroPad = (num: number, places: number) => String(num).padStart(places, '0')
	const a = new Date(UNIX_timestamp * 1000)
	const year = a.getFullYear()
	const month = zeroPad(a.getMonth()+1, 2)
	const day = zeroPad(a.getDate(), 2)
	const hour = zeroPad(a.getHours(), 2)
	const min = zeroPad(a.getMinutes(), 2)
	return `${year}.${month}.${day} ${hour}:${min}`
}

export {timeConverter}