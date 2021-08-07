//标注面板的监听函数
let onToolbarObserve =  (mutationsList, observer)=>{
    for(let mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
            let readerToolbarContainer = document.getElementsByClassName('reader_toolbar_container')[0];
            //如果选中了文字
            if(window.getComputedStyle(readerToolbarContainer).display=='block' && document.getElementsByClassName('wr_selection')[0]){
                //结束监听以方式监听面板消失时触发自动标注
                observer.disconnect();
                const storageKey = 'selectAction'
                chrome.storage.sync.get([storageKey], function(setting){
                    let targetUnderlineBtn = document.getElementsByClassName(`toolbarItem ${setting[storageKey]}`)[0]
                    if(setting[storageKey] != "underlineNone" && targetUnderlineBtn){
                        targetUnderlineBtn.click()
                    }
                    //重新监听
                    observerToolbar();
                })
            }
        }
    }
}
//标注面板的父元素的监听函数
let secondObserver;
let onContainerObserve = (mutationsList, observer)=>{
    for(let mutation of mutationsList) {
        if (mutation.type === 'childList') {
            let readerToolbarContainer = document.getElementsByClassName('reader_toolbar_container')[0];
            //如果标注面板出现
            if(readerToolbarContainer){
                //开始监听标注面板
                observerToolbar();
                //在监听到标注面板出现后结束监听
                observer.disconnect();
            }
            //如果选中了文字
            if(readerToolbarContainer
                && window.getComputedStyle(readerToolbarContainer).display=='block'
                && document.getElementsByClassName('wr_selection')[0]){
                const storageKey = 'selectAction'
                chrome.storage.sync.get([storageKey], function(setting){
                    let targetUnderlineBtn = document.getElementsByClassName(`toolbarItem ${setting[storageKey]}`)[0]
                    if(setting[storageKey] != "underlineNone" && targetUnderlineBtn){
                        targetUnderlineBtn.click();
                    }
                })
            }
        }
    }
}
//为标注面板（readerToolbarContainer）添加监听函数
let observerToolbar = ()=>{
    secondObserver = new MutationObserver(onToolbarObserve);
    let readerToolbarContainer = document.getElementsByClassName('reader_toolbar_container')[0];
    if(!readerToolbarContainer) {
        window.setTimeout(observerToolbar,500);
        return;
    }
    secondObserver.observe(readerToolbarContainer, {'attributes':true});
}
// 在第一次使用标注之前，页面中不存在 readerToolbarContainer，这导致第一次标注时不会触发自动标注
// 所以使用该函数设置对 readerToolbarContainer 的父元素（renderTargetContainer）的监听
let firstObserver;
let observerContainer =  ()=>{
    firstObserver = new MutationObserver(onContainerObserve);
    let renderTargetContainer = document.getElementsByClassName('renderTargetContainer')[0];
    if(!renderTargetContainer){
        window.setTimeout(observerContainer,500);
        return;
    }
    firstObserver.observe(renderTargetContainer, {'childList':true});
}


// 使用扩展通知来处理切换章节后失效的问题
chrome.runtime.onMessage.addListener(function(msg){
    if(!msg.isSelectAction) return;
    if(firstObserver !== undefined){
        firstObserver.disconnect();
        // 没有标注时切换章节
        if(secondObserver === undefined){
            observerContainer();
        }
    }else{
        observerContainer();
    }
});