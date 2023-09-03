// 监听 storage 改变
chrome.storage.onChanged.addListener(function (changes, namespace) {
    console.log(`new ${namespace} changes`, changes)
})
