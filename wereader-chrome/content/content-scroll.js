/* 用于实现进度查看（并不是直接实现而是由 content-theme.js 调用） */

var count = -1
//添加进度查看按钮并绑定点击事件
function addProgressBtn(){
    //设置按钮
    var progressBtn = document.createElement("button")
    var btnDiv = document.getElementsByClassName("readerControls readerControls")[0]
    var appCode = document.getElementsByClassName("readerControls_item download")[0]
    if(!appCode || !btnDiv){
        return
    }
    btnDiv.insertBefore(progressBtn, appCode)
    appCode.style.display = "none"
    progressBtn.setAttribute("title", "进度")
    progressBtn.setAttribute("class","readerControls_item download")
    //设置按钮文字
    var span2=document.createElement("span")
    span2.textContent = "进度"
    span2.id = "progressText"
    //如果网页一开始为夜色模式，则需要将span文字颜色设置为灰色，否则保持默认
    if(document.getElementsByClassName("readerControls_item white").length != 0){
        span2.style.color = "rgb(190,190,190)"
    }else{
        span2.style.color = "rgb(0,0,0)"
    }
    progressBtn.appendChild(span2)
    
    //绑定点击事件
    progressBtn.addEventListener('click', function(){
        //切换滚筒条显隐
        if(count == -1){
            chrome.runtime.sendMessage({type: "injectCss", css: "inject/showScroll.css"})
        }else{
            chrome.runtime.sendMessage({type: "injectCss", css: "content/content-hideScroll.css"})
        }
        count = count * (-1)
    },false)
}