//页面加载完毕后开始执行
window.onload = function () {
    //获取并设置bid、vid
    getuserVid(function(userVid){
        var bg = chrome.extension.getBackgroundPage();
        //var userVid = bg.getuserVid();
        var bookId = bg.getbookId();
        /* var version = chrome.runtime.getManifest().version
        document.getElementById("title").innerHTML = '<strong>wereader</strong> ' + version */
        document.getElementById("bookId").innerHTML = "bid：" + bookId;
        document.getElementById("userVid").innerHTML = "vid：" + userVid;
        //获取bid / vid失败则提醒
        if (document.getElementById("userVid").innerHTML == "vid：null" && document.getElementById("bookId").innerHTML == "bid：null") {
            bg.sendAlertMsg({title:"Oops...", text:"userVid == \"null\"，bookId == \"null\"，请确保正常登陆后刷新重试", button: {text: "确定"}});
            window.close();
        } else {
            if (document.getElementById("userVid").innerHTML == "vid：null") {
                bg.sendAlertMsg({title:"Oops...", text:"userVid == \"null\"，请确保正常登陆", button: {text: "确定"}});
                window.close();
            }
            if (document.getElementById("bookId").innerHTML == "bid：null") {
                bg.sendAlertMsg({title:"Oops...", text:"bookId == \"null\"，请刷新重试", button: {text: "确定"}});
                window.close();
            }
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
            if (choose.style.display != "block") {
                choose.style.display = "block";
            } else {
                choose.style.display = "none";
            }
        }, false);
        //纯文本
        getText.addEventListener('click', function () {
            bg.getComment("https://i.weread.qq.com/review/list?listType=6&userVid=" + userVid + "&rangeType=2&mine=1&listMode=1", bookId, false);
            window.close();
        }, false);
        //HTML
        getHtml.addEventListener('click', function () {
            bg.getComment("https://i.weread.qq.com/review/list?listType=6&userVid=" + userVid + "&rangeType=2&mine=1&listMode=1", bookId, true);
            window.close();
        }, false);
        //获取标注
        document.getElementById("getBookMarks").addEventListener('click', function () {
            if (chooseMark.style.display != "block") {
                chooseMark.style.display = "block";
            } else {
                chooseMark.style.display = "none";
            }
        }, false);
        //本章
        getThisChapter.addEventListener('click', function () {
            bg.copyBookMarks("https://i.weread.qq.com/book/bookmarklist?bookId=" + bookId, false);
            window.close();
        }, false);
        //全部
        getAll.addEventListener('click', function () {
            bg.copyBookMarks("https://i.weread.qq.com/book/bookmarklist?bookId=" + bookId, true);
            window.close();
        }, false);
        //获取目录
        document.getElementById("getBookContents").addEventListener('click', function () {
            bg.getBookContents();
            window.close();
        }, false);
        //获取热门标注
        document.getElementById("getBestBookMarks").addEventListener('click', function () {
            bg.copyBestBookMarks("https://i.weread.qq.com/book/bestbookmarks?bookId=" + bookId);
            window.close();
        }, false);
        //获取我的想法
        document.getElementById("getMyThoughts").addEventListener('click', function () {
            bg.copyThought("https://i.weread.qq.com/review/list?bookId=" + bookId + "&listType=11&mine=1&synckey=0&listMode=0");
            window.close();
        }, false);
        //开启复制图片
        document.getElementById("inject").addEventListener('click', function () {
            bg.injectCopyBtn();
            window.close();
        }, false);
        document.getElementById("bookId").addEventListener('click', function () {
            bg.sendAlertMsg({
                title:"Oops...",text:"放心，这是测试...",button:{text:"确定"}
            });
            window.close();
        }, false);
    })
    
}

//获取userVid
function getuserVid(callback) {
	//获取当前页面
	chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
		var url = ""
        url = tabs[0].url;
        var list = url.split("/")
        //检查是否为读书页，是则获取userVid
		if (list[2] == "weread.qq.com" && list[3] == "web" && list[4] == "reader" && list[5] != "") {
			//获取当前页面的cookie然后设置bookId和userVid
			chrome.cookies.get({
				url: url,
				name: 'wr_vid'
			}, function (cookie) {
				if (cookie == null) {
					callback("null")
				} else {
					callback(cookie.value.toString())
				}
			});
		}else{
			console.log("getuserVid()：不为读书页面")
		}
	});
}