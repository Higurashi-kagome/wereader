//标注面板的监听函数
function onReaderToolbarContainerObserve(mutationsList, observer){
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
                    if(setting[storageKey] != "underlinNone" && targetUnderlineBtn){
                        targetUnderlineBtn.click()
                    }
                    //重新监听
                    addObserverForReaderToolbarContainer();
                })
            }
        }
    }
}

//标注面板的父元素的监听函数
function onRenderTargetContainerObserve(mutationsList, observer){
    for(let mutation of mutationsList) {
        if (mutation.type === 'childList') {
            let readerToolbarContainer = document.getElementsByClassName('reader_toolbar_container')[0];
            //如果标注面板出现
            if(readerToolbarContainer){
                //开始监听标注面板
                addObserverForReaderToolbarContainer();
                //在监听到标注面板出现后结束监听
                observer.disconnect();
            }
            //如果选中了文字
            if(window.getComputedStyle(readerToolbarContainer).display=='block' && document.getElementsByClassName('wr_selection')[0]){
                const storageKey = 'selectAction'
                chrome.storage.sync.get([storageKey], function(setting){
                    let targetUnderlineBtn = document.getElementsByClassName(`toolbarItem ${setting[storageKey]}`)[0]
                    if(setting[storageKey] != "underlinNone" && targetUnderlineBtn){
                        targetUnderlineBtn.click();
                    }
                })
            }
        }
    }
}

//为标注面板（readerToolbarContainer）添加监听函数
function addObserverForReaderToolbarContainer() {
    let observer = new MutationObserver(onReaderToolbarContainerObserve);
    let readerToolbarContainer = document.getElementsByClassName('reader_toolbar_container')[0];
    if(!readerToolbarContainer) {
        window.setTimeout(addObserverForReaderToolbarContainer,500);
        return;
    }
    observer.observe(readerToolbarContainer, {'attributes':true});
}

//在不使用标注之前，页面中不存在 readerToolbarContainer，这导致第一次标注时不会触发自动标注，所以使用该函数设置对 readerToolbarContainer 的父元素（renderTargetContainer）的监听
function addObserverForRenderTargetContainer(){
    let observer = new MutationObserver(onRenderTargetContainerObserve);
    let renderTargetContainer = document.getElementsByClassName('renderTargetContainer')[0];
    if(!renderTargetContainer){
        window.setTimeout(addObserverForRenderTargetContainer,500);
        return;
    }
    observer.observe(renderTargetContainer, {'childList':true});
}

//console.log('content-selectAction.js：注入');
window.addEventListener('load', addObserverForRenderTargetContainer);