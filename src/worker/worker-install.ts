import { initBookIds, initBooks } from './worker-vars'
import { notify } from './worker-notification'

// 监听安装事件
chrome.runtime.onInstalled.addListener(function (details) {
    initBookIds()
    initBooks()
    const onUpdated = true
    const onInstall = false
    if (details.reason === 'install' && onInstall) {
        chrome.tabs.create({ url: 'https://github.com/Higurashi-kagome/wereader/issues/9' })
    } else if (details.reason === 'update' && onUpdated) {
        notify('新版本加回选中后动作功能，请阅读注意事项。')
        chrome.runtime.openOptionsPage()
    }
})
