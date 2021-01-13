//页面加载完毕后开始执行
window.onload = function () {
    //获取并设置bid、vid
    getuserVid(function(userVid){
        var bg = chrome.extension.getBackgroundPage()
        var bookId = bg.getbookId()
        document.getElementById("bookId").textContent = "bid：" + bookId
        document.getElementById("userVid").textContent = "vid：" + userVid
        //获取bid / vid失败则提醒
        if (bookId == "null" || userVid == "null") {
            bg.aler("似乎出了一点问题...请确保正常登陆后刷新重试~")
            window.close()
        }
        //遍历按钮绑定点击事件
        var ids = ["getComment","getComment_text","getComment_html","getBookMarks","getThisChapter","getAll","getBookContents","getBestBookMarks","getMyThoughts","inject","testBtn"]
        for(var i=0;i<ids.length;i++){
            document.getElementById(ids[i]).addEventListener('click', function(){
                listener(this.id)
            }, false)
        }
        //点击调用该函数
        function listener(id){
            switch(id){
                case "getComment":
                    let choose = document.getElementById("choose")
                    choose.style.display = (choose.style.display != "block") ? "block" : "none"
                    return
                case "getComment_text":
                    bg.getComment(userVid, bookId, false)
                    break
                case "getComment_html":
                    bg.getComment(userVid, bookId, true)
                    break
                case "getBookMarks":
                    let chooseMark = document.getElementById("choose_mark")
                    chooseMark.style.display = (chooseMark.style.display != "block") ? "block" : "none"
                    return
                case "getThisChapter":
                    bg.copyBookMarks(bookId, false)
                    break
                case "getAll":
                    bg.copyBookMarks(bookId, true)
                    break
                case "getBookContents":
                    bg.copyContents()
                    break
                case "getBestBookMarks":
                    bg.copyBestBookMarks(bookId)
                    break
                case "getMyThoughts":
                    bg.copyThought(bookId)
                    break
                case "inject":
                    chrome.tabs.executeScript({ file: 'inject/inject-copyBtn.js' }, function (result) {
                        bg.catchErr("popup.js")
                    })
                    break
                case "testBtn":
                    bg.logStorage("sync")
                    break
                default:
                    break
            }
            window.close()
        }
    })
    
}

//从当前页面获取 userVid
function getuserVid(callback){
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
		let url = ""
        url = tabs[0].url
		chrome.cookies.get({url: url,name: 'wr_vid'}, function (cookie) {
            if(chrome.runtime.lastError){
                bg.catchErr("popup.js => chrome.cookies.get()")
                callback("null")
            }else{
			    cookie == null ? callback("null") : callback(cookie.value.toString())
            }
		})
	})
}
