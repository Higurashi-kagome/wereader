import { ConfigType } from '../worker/worker-vars'

export function getLocalStorage(key: string | null = null): Promise<unknown> {
    return new Promise((suc, rej) => {
        function onReceive(local: {[key: string]: unknown}) {
            if (chrome.runtime.lastError) {
                rej(chrome.runtime.lastError.message)
            } else {
                suc(key ? local[key] : local)
            }
        }
        if (!key) {
            chrome.storage.local.get(onReceive)
        } else {
            chrome.storage.local.get([key], onReceive)
        }
    })
}

export function getSyncStorage(key: string | null | string[] = null)
    : Promise<ConfigType | unknown> {
    return new Promise((res, rej) => {
        let keys = null
        if (typeof key === 'string') {
            keys = [key]
        } else {
            keys = key
        }
        chrome.storage.sync.get(keys, function (sync) {
            if (chrome.runtime.lastError) {
                rej(chrome.runtime.lastError.message)
            } else if (typeof key === 'string') {
                res(sync[key])
            } else {
                res(sync)
            }
        })
    })
}

/**
 * 获取配置信息
 * @returns 配置信息
 */
export async function getConfig(): Promise<ConfigType> {
    return getSyncStorage() as Promise<ConfigType>
}

// 排序（只处理整数键）
/* eslint-disable */
export function sortByKey(array: {[key: string]: any}[], key: string) {
/* eslint-enable */
    return array.sort((a, b) => {
        const x = parseInt(a[key])
        const y = parseInt(b[key])
        // eslint-disable-next-line no-nested-ternary
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

/**
 * 时间戳转时间字符串
 * @param timestamp 时间戳（秒为单位）
 * @returns 格式化时间字符串
 */
export function formatTimestamp(timestamp: number) {
    // 乘 1000 转为毫秒单位
    const date = new Date(timestamp * 1000)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}
