/* 主要用于实现阅读页主题色切换，另外还负责从 content-scroll.js 中调用函数帮助实现进度*/

//console.log("inject-theme.js：被注入")
//添加主题切换按钮并绑定点击事件
function addThemeBtn(){
    //设置按钮
    var theme = document.createElement("button")
    var btnDiv = document.getElementsByClassName("readerControls readerControls")[0]
    var dark_white = btnDiv.children[3]
    btnDiv.insertBefore(theme, dark_white)
    dark_white.style.display = "none"
    theme.setAttribute("title", "主题")
    theme.setAttribute("class","readerControls_item theme")
    //设置按钮文字
    var span1=document.createElement("span")
    span1.textContent = "主题"
    //如果网页一开始为夜色模式，则需要将span文字颜色设置为灰色，否则保持默认
    if(document.getElementsByClassName("readerControls_item white").length != 0){
        span1.style.color = "rgb(190,190,190)"
    }else{
        span1.style.color = "rgb(0,0,0)"
    }
    theme.appendChild(span1)
    
    //改变主题
    function changeTheme(){
        //如果当前主题为夜色模式
        if(document.getElementsByClassName("readerControls_item white").length != 0){
            //设置白色主题
            Flag=-1
            chrome.runtime.sendMessage({type: "injectCss", css: "theme/white.css"})
            clickDarkOrWhite("readerControls_item white")
            //从黑色主题到白色主题恢复span文字颜色
            span1.style.color = "rgb(0,0,0)"
            span2 = document.getElementById("progressText")
            if(span2){
                span2.style.color = "rgb(0,0,0)"
            }
        }else if(Flag == 0){
            //设置绿色主题
            if(document.getElementsByClassName("readerControls_item white").length != 0){
                clickDarkOrWhite("readerControls_item white")
            }
            chrome.runtime.sendMessage({type: "injectCss", css: "theme/green.css"})
        }else if(Flag == 1){
            //设置橙色主题
            if(document.getElementsByClassName("readerControls_item white").length != 0){
                clickDarkOrWhite("readerControls_item white")
            }
            chrome.runtime.sendMessage({type: "injectCss", css: "theme/orange.css"})
        }else if(Flag == 2){
            //设置黑色主题
            chrome.runtime.sendMessage({type: "injectCss", css: "theme/dark.css"})
            clickDarkOrWhite("readerControls_item dark")
            //更改span文字图标颜色
            span1.style.color = "rgb(190,190,190)"
            span2 = document.getElementById("progressText")
            if(span2){
                span2.style.color = "rgb(190,190,190)"
            }
        }
        //保存当前主题对应编号
        chrome.storage.sync.set({flag: Flag})
    }
    //点击原网页的白色/黑色主题切换按钮
    function clickDarkOrWhite(classN){
        try{
            document.getElementsByClassName(classN)[0].click();
        }catch(err){
            console.log("clickDarkOrWhite(classN) => " + err.message);
        }
    }

    //绑定点击事件
    theme.addEventListener('click', function(){
        try{
            changeTheme()
            Flag = Flag + 1
        }catch (error) {
            Swal.fire({title: "Oops...",text: "似乎出了点问题，刷新一下试试吧~",icon: "error",confirmButtonText: 'OK'})
        }
    },false)
}

var Flag = 0
//轮询，主题初始化（实现记住上次设置的背景主题）
const timeId = setInterval(() => {
    //如果发现页面显示正在加载
    if (document.getElementsByClassName("readerChapterContentLoading").length != 0) {
        //设置背景色
        try{
            chrome.storage.sync.get(['flag'], function(result) {
                if(result.flag == 0){
                    //设置绿色主题
                    if(document.getElementsByClassName("readerControls_item white").length != 0){
                        clickDarkOrWhite("readerControls_item white")
                    }
                    chrome.runtime.sendMessage({type: "injectCss", css: "theme/green.css"})
                    Flag = 1
                }else if(result.flag == 1){
                    //设置橙色主题
                    if(document.getElementsByClassName("readerControls_item white").length != 0){
                        clickDarkOrWhite("readerControls_item white")
                    }
                    chrome.runtime.sendMessage({type: "injectCss", css: "theme/orange.css"})
                    Flag = 2
                }else{
                    Flag = 0
                }
            })
        }catch(err){
            console.log("content-theme.js => setInterval() => " + err.message)
        }
        //结束定时器
        clearInterval(this.timeId)
    }
},10)

window.onload = function(){
    //分别尝试获取日间模式/夜间模式切换按钮
    var white = document.getElementsByClassName("readerControls_item white")[0]
    //如果切换到白色主题按钮存在且显示
    if(white != undefined && white.style.display != "none"){
        addThemeBtn()
    }
    dark = document.getElementsByClassName("readerControls_item dark")[0]
    //如果切换到黑色主题按钮存在且显示
    if(dark != undefined && dark.style.display != "none"){
        addThemeBtn()
    }
    /* 从一同被注入的 content-scroll.js 脚本中调用函数实现进度切换按钮 */
    //尝试获取app下载按钮
    var appDownload = document.getElementsByClassName("readerControls_item download")[0]
    //如果按钮存在且显示
    if(appDownload != undefined && appDownload.style.display != "none"){
        addProgressBtn()
    }
}