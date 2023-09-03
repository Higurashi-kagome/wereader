import { isPlainObject } from '../common/is'
import { getBookIds } from './worker-vars'

// 添加标签页关闭事件监听器
chrome.tabs.onRemoved.addListener(function (tabId) {
    console.log('onRemoved: ', tabId)
    getBookIds().then(bookIds => {
        if (isPlainObject(bookIds) && bookIds[tabId]) {
            delete bookIds[tabId]
        }
    })
})
