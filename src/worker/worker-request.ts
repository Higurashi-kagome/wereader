import { getBookId, getBookIds, getChapIdx } from './worker-vars'
import { getCurTab } from './worker-utils'
import {
    bestBookmarksFilter,
    bookInfoFilter,
    bookmarksFilter,
    chapInfoFilter,
    reviewFilter
} from '../debugger/debugger-filters'

// 监听读书页请求，由请求得到 bookId
chrome.webRequest.onBeforeRequest.addListener(details => {
    const { tabId, url } = details
    if (url.indexOf('bookmarklist?bookId=') < 0) return
    const bookId = url.replace(/(^.*bookId=|&type=1)/g, '')
    getBookIds().then(bookIds => {
        bookIds = bookIds || {}
        bookIds[tabId] = bookId
        chrome.storage.local.set({ bookIds })
    })
}, { urls: ['*://weread.qq.com/web/book/*'] })

// 监听读书页阅读记录请求，获取章节 Uid
chrome.webRequest.onBeforeRequest.addListener(details => {
    let raw
    if (details?.requestBody?.raw) {
        raw = details.requestBody.raw[0]
    }
    const decoder = new TextDecoder('utf-8')
    const requestBody = decoder.decode(raw?.bytes)
    const jsonData = requestBody ? JSON.parse(requestBody) : {}
    if (jsonData.ci) {
        getChapIdx().then(chapIdx => {
            chapIdx = chapIdx || {}
            chapIdx[details.tabId] = jsonData.ci
            console.log('chapIdx', chapIdx)
            chrome.storage.local.set({ chapIdx })
        })
    }
}, { urls: ['*://weread.qq.com/web/book/read'] }, ['requestBody'])

/**
 * 获取请求头
 * @param requestHeaders 保存的请求头信息
 * @returns {Headers} 请求头
 */
function getHeaders(requestHeaders: chrome.webRequest.HttpHeader[] = []): Headers {
    // 获取请求头
    const headers = new Headers()
    requestHeaders.forEach(header => {
        if (header.value) {
            headers.append(header.name, header.value)
        }
    })
    return headers
}

// 监听请求，保存请求 Options
chrome.webRequest.onBeforeSendHeaders.addListener(details => {
    const { url, requestHeaders } = details
    // 保存请求配置
    getCurTab().then(tab => {
        // 基础配置
        const params = {
            referrer: tab.url,
            referrerPolicy: 'strict-origin-when-cross-origin',
            mode: 'cors',
            credentials: 'include'
        }
        const headers = getHeaders(requestHeaders)
        // 保存章节请求 Options
        if (chapInfoFilter(url)) {
            getBookId().then(bookId => {
                chrome.storage.local.set({
                    chapterInfosFetchOptions: {
                        headers,
                        ...params,
                        method: 'POST',
                        body: `{"bookIds":["${bookId}"]}`
                    }
                })
            })
        }
        // 保存想法请求 Options
        if (reviewFilter(url)) {
            chrome.storage.local.set({
                reviewFetchOptions: {
                    headers,
                    ...params,
                    method: 'GET',
                    body: null
                }
            })
        }
        // 保存标注请求 Options
        if (bookmarksFilter(url)) {
            chrome.storage.local.set({
                bookmarkFetchOptions: {
                    headers,
                    ...params,
                    method: 'GET',
                    body: null
                }
            })
        }
        // 保存书本信息请求 Options
        if (bookInfoFilter(url)) {
            chrome.storage.local.set({
                bookInfoFetchOptions: {
                    headers,
                    ...params,
                    method: 'GET',
                    body: null
                }
            })
        }
        // 保存热门标注请求 Options
        if (bestBookmarksFilter(url)) {
            chrome.storage.local.set({
                bestBookmarksFetchOptions: {
                    headers,
                    ...params,
                    method: 'GET',
                    body: null
                }
            })
        }
    })
}, { urls: ['*://weread.qq.com/web/book/*'] }, ['requestHeaders'])
