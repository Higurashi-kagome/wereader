//页面加载完毕后开始执行
window.onload = function () {
    //获取并设置bid、vid
    getuserVid(function(userVid){
        chrome.storage.sync.get(null, function(setting) {
            var bg = chrome.extension.getBackgroundPage();
            var bookId = bg.getbookId();
            document.getElementById("bookId").innerHTML = "bid：" + bookId;
            document.getElementById("userVid").innerHTML = "vid：" + userVid;
            //获取bid / vid失败则提醒
            if (!bookId || !userVid) {
                bg.sendAlertMsg({title:"Oops...", text:"获取信息出错，请确保正常登陆后刷新重试", confirmButtonText: '确定',icon: "error"});
                window.close();
            }
            //"获取书评"和"获取标注"元素及其子元素
            var getText = document.getElementById("getComment_text");
            var getHtml = document.getElementById("getComment_html");
            var getThisChapter = document.getElementById("getThisChapter");
            var getAll = document.getElementById("getAll");
            var choose = document.getElementById("choose");
            var chooseMark = document.getElementById("choose_mark");
            /*绑定点击事件*/
            //获取书评
            document.getElementById("getComment").addEventListener('click', function () {
                (choose.style.display != "block") ? (choose.style.display = "block") : (choose.style.display = "none")
            }, false);
            //纯文本
            getText.addEventListener('click', function () {
                bg.getComment(userVid, bookId, false);
                window.close();
            }, false);
            //HTML
            getHtml.addEventListener('click', function () {
                bg.getComment(userVid, bookId, true);
                window.close();
            }, false);
            //获取标注
            var add = setting.addThoughts ? true : false
            document.getElementById("getBookMarks").addEventListener('click', function () {
                (chooseMark.style.display != "block") ? (chooseMark.style.display = "block") : (chooseMark.style.display = "none")
            }, false);
            //本章
            getThisChapter.addEventListener('click', function () {
                bg.copyBookMarks(bookId, false, add);
                window.close();
            }, false);
            //全部
            getAll.addEventListener('click', function () {
                bg.copyBookMarks(bookId, true, add);
                window.close();
            }, false);
            //获取目录
            document.getElementById("getBookContents").addEventListener('click', function () {
                bg.injectScript({ file: 'inject/inject-getContents.js' })
                window.close();
            }, false);
            //获取热门标注
            var add = setting.displayN ? true : false
            document.getElementById("getBestBookMarks").addEventListener('click', function () {
                bg.copyBestBookMarks(bookId,add);
                window.close();
            }, false);
            //获取我的想法
            document.getElementById("getMyThoughts").addEventListener('click', function () {
                bg.copyThought(bookId);
                window.close();
            }, false);
            //开启复制图片
            document.getElementById("inject").addEventListener('click', function () {
                bg.injectScript({ file: 'inject/inject-copyBtn.js' })
                window.close();
            }, false);
            //测试
            document.getElementById("testBtn").addEventListener('click', function () {
                //chapterAndMarks = bg.copyBookMarks(bookId,false,true)
                //bg.aler(JSON.stringify(config))
                //bg.sendAlertMsg({title:"Oops...", text:"这是测试...", confirmButtonText: '确定'})
                window.close()
            }, false);
        })
    })
    
}

//从当前页面获取 userVid
function getuserVid(callback){
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
		var url = ""
		try{
			url = tabs[0].url
		}catch(err){
			console.log(err)
		}
		chrome.cookies.get({url: url,name: 'wr_vid'}, function (cookie) {
			cookie == null ? callback("null") : callback(cookie.value.toString())
		})
	})
}

/*流程*/
/*
//页面加载完毕
window.onload = function () {
    //获取 userVid
    getuserVid(callback){
        //获取背景页
        //给 popup 页面绑定点击事件（点击后调用背景页中相应的函数）
    })
}
*/