import { isPlainObject } from '../common/is'
import { deleteTab, getBookIds, saveTab } from './worker-vars'
import { logger } from '../common/logger'

// 添加标签页关闭事件监听器
chrome.tabs.onRemoved.addListener(tabId => {
    logger.debug('tabs.onRemoved', tabId)
    getBookIds()
        .then(bookIds => {
            if (isPlainObject(bookIds) && bookIds[tabId]) {
                delete bookIds[tabId]
            }
        })
    deleteTab(tabId).catch()
})

// 添加标签页更新事件监听器
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    logger.debug('tabs.onUpdated', tab)
    saveTab(tab).then()
})
