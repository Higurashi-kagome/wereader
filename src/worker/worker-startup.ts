import { initBookIds, initBooks } from './worker-vars'

// 浏览器启动事件
chrome.runtime.onStartup.addListener(function () {
    console.log('onStartup')
    initBookIds()
    initBooks()
})
