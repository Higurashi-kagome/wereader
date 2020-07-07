//页面加载完毕后开始执行
window.onload = function(){
    //获取并设置bid、vid
    var bg = chrome.extension.getBackgroundPage();
    var userVid = bg.getuserVid();
    var bookId = bg.getbookId();
    /* var version = chrome.runtime.getManifest().version
    document.getElementById("title").innerHTML = '<strong>wereader</strong> ' + version */
    document.getElementById("bookId").innerHTML = "bid：" + bookId;
    document.getElementById("userVid").innerHTML = "vid：" + userVid;
    //获取bid/vid失败则提醒
    if(document.getElementById("userVid").innerHTML == "vid：null" && document.getElementById("bookId").innerHTML == "bid：null"){
        bg.notify("userVid == \"null\"，bookId == \"null\"，请确保正常登陆后刷新重试");
        window.close();
    }else{
        if(document.getElementById("userVid").innerHTML == "vid：null"){
            bg.notify("userVid == \"null\"，请确保正常登陆");
            window.close();
        }
        if(document.getElementById("bookId").innerHTML == "bid：null"){
            bg.notify("bookId == \"null\"，请刷新重试");
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
    document.getElementById("getComment").addEventListener('click', function(){
        if(choose.style.display != "block"){
            choose.style.display = "block";
            getText.style.display = "block";
            getHtml.style.display = "block";
        }else{
            choose.style.display = "none";
            getText.style.display = "none";
            getHtml.style.display = "none";
        }
    }, false);
    //纯文本
    document.getElementById("getComment_text").addEventListener('click', function(){
        bg.getComment("https://i.weread.qq.com/review/list?listType=6&userVid=" + userVid + "&rangeType=2&mine=1&listMode=1",bookId,false);
        window.close();
    }, false);
    //HTML
    document.getElementById("getComment_html").addEventListener('click', function(){
        bg.getComment("https://i.weread.qq.com/review/list?listType=6&userVid=" + userVid + "&rangeType=2&mine=1&listMode=1",bookId,true);
        window.close();
    }, false);
    //获取标注
    document.getElementById("getBookMarks").addEventListener('click', function(){
        if(chooseMark.style.display != "block"){
            chooseMark.style.display = "block";
            getThisChapter.style.display = "block";
            getAll.style.display = "block";
        }else{
            chooseMark.style.display = "none";
            getThisChapter.style.display = "none";
            getAll.style.display = "none";
        }
    }, false);
    //本章
    document.getElementById("getThisChapter").addEventListener('click', function(){
        bg.copyBookMarks("https://i.weread.qq.com/book/bookmarklist?bookId=" + bookId,false);
        window.close();
    }, false);
    //全部
    document.getElementById("getAll").addEventListener('click', function(){
        bg.copyBookMarks("https://i.weread.qq.com/book/bookmarklist?bookId=" + bookId,true);
        window.close();
    }, false);
    //获取目录
    document.getElementById("getBookContents").addEventListener('click', function(){
        bg.getBookContents();
        window.close();
    }, false);
    //获取热门标注
    document.getElementById("getBestBookMarks").addEventListener('click', function(){
        bg.copyBestBookMarks("https://i.weread.qq.com/book/bestbookmarks?bookId=" + bookId);
        window.close();
    }, false);
    //获取我的想法
    document.getElementById("getMyThoughts").addEventListener('click', function(){
        bg.copyThought("https://i.weread.qq.com/review/list?bookId=" + bookId + "&listType=11&mine=1&synckey=0&listMode=0");
        window.close();
    }, false);
    //开启复制图片
    document.getElementById("inject").addEventListener('click', function(){
        bg.injectCopyBtn();
        window.close();
    }, false);
}