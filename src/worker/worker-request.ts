import { getBookIds, getChapIdx } from './worker-vars'

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
