import { ConfigType } from "../worker/worker-vars"

export function getLocalStorage(key: string | null = null): Promise<unknown> {
	return new Promise((res, rej) => {
		function onReceive(local: {[key: string]: unknown}) {
			if(chrome.runtime.lastError){
				rej(chrome.runtime.lastError.message)
			}else{
				key ? res(local[key]) : res(local)
			}
		}
		if (!key) {
			chrome.storage.local.get(onReceive)
		} else {
			chrome.storage.local.get([key], onReceive)
		}
	})
}

export function getSyncStorage(key: string | null | string[] = null): Promise<ConfigType | unknown> {
	return new Promise((res, rej) => {
		let keys = null
		if(typeof key == "string"){
			keys = [key]
		}else{
			keys = key
		}
		chrome.storage.sync.get(keys, function(sync) {
			if(chrome.runtime.lastError){
				rej(chrome.runtime.lastError.message)
			}else{
				if(typeof key == "string"){
					res(sync[key])
				}else{
					res(sync)
				}
			}
		})
	})
}

// 排序（只处理整数键）
/* eslint-disable */
export function sortByKey(array: {[key: string]: any}[], key: string) {
/* eslint-enable */
	return array.sort((a, b) => {
		const x = parseInt(a[key])
		const y = parseInt(b[key])
		return ((x < y) ? -1 : ((x > y) ? 1 : 0))
	})
}

// https://github.com/GoogleChrome/chrome-extensions-samples/blob/f608c65e61c2fbf3749ccba88ddce6fafd65e71f/functional-samples/cookbook.offscreen-clipboard-write/offscreen.js#L55
export function commandCopy(text: string, selector: string) {
	const textEl = document.querySelector(selector) as HTMLTextAreaElement
	textEl.value = text
	textEl.select()
	document.execCommand('copy')
}