//页面加载完毕后开始执行
window.onload = function () {
    var bg = chrome.extension.getBackgroundPage();
    //获取并设置bid、vid
    bg.getuserVid(function(userVid){
        //var userVid = bg.getuserVid();
        var bookId = bg.getbookId();
        /* var version = chrome.runtime.getManifest().version
        document.getElementById("title").innerHTML = '<strong>wereader</strong> ' + version */
        document.getElementById("bookId").textContent = "bid：" + bookId;
        document.getElementById("userVid").textContent = "vid：" + userVid;
        //获取bid / vid失败则提醒
        if (document.getElementById("userVid").innerHTML == "vid：null" && document.getElementById("bookId").innerHTML == "bid：null") {
            bg.sendAlertMsg({title:"Oops...", text:"userVid == \"null\"，bookId == \"null\"。\n请确保正常登陆后刷新重试", button: {text: "确定"}});
            window.close();
        } else {
            if (document.getElementById("userVid").innerHTML == "vid：null") {
                bg.sendAlertMsg({title:"Oops...", text:"userVid == \"null\"。\n请确保正常登陆", button: {text: "确定"}});
                window.close();
            }
            if (document.getElementById("bookId").innerHTML == "bid：null") {
                bg.sendAlertMsg({title:"Oops...", text:"bookId == \"null\"。\n请刷新重试", button: {text: "确定"}});
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
            (choose.style.display != "block") ? (choose.style.display = "block") : (choose.style.display = "none")
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
            (chooseMark.style.display != "block") ? (chooseMark.style.display = "block") : (chooseMark.style.display = "none")
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
            bg.injectScript({ file: '/inject/inject-copyBtn.js' })
            window.close();
        }, false);
        /*document.getElementById("bookId").addEventListener('click', function () {
            bg.sendAlertMsg({
                title:"Oops...",text:"放心，这是测试...",button:{text:"确定"}
            });
            window.close();
        }, false);*/
    })
    
}