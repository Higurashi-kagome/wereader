//console.log('content-rightClick.js：被注入');
chrome.storage.sync.get(['enableRightClick'],(result)=>{
    if(!result.enableRightClick) return;
    window.addEventListener("contextmenu",function(t) {
        t.stopImmediatePropagation();
    },true);
})
