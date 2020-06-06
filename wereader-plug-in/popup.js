window.onload=function(){
    //获取书评
    document.getElementById("getComment").addEventListener('click', function(){
        var bg = chrome.extension.getBackgroundPage();
        bg.getComment("https://i.weread.qq.com/review/list?listType=6&userVid=" + userVid + "&rangeType=2&mine=1&listMode=1",bookId,true);
        window.close();
    }, false);
    //获取标注
    document.getElementById("getBookMarks").addEventListener('click', function(){
        var bg = chrome.extension.getBackgroundPage();
        bg.getData("https://i.weread.qq.com/book/bookmarklist?bookId=" + bookId);
        window.close();
    }, false);
    //获取目录
    document.getElementById("getBookContents").addEventListener('click', function(){
        var bg = chrome.extension.getBackgroundPage();
        bg.getData("https://i.weread.qq.com/book/bookmarklist?bookId=" + bookId);
        window.close();
    }, false);
    //获取热门标注
    document.getElementById("getBestBookMarks").addEventListener('click', function(){
        var bg = chrome.extension.getBackgroundPage();
        bg.getData("https://i.weread.qq.com/book/bestbookmarks?bookId=" + bookId);
        window.close();
    }, false);
    //获取我的想法
    document.getElementById("getMyThoughts").addEventListener('click', function(){
        var bg = chrome.extension.getBackgroundPage();
        bg.getData("https://i.weread.qq.com/review/list?bookId=" + bookId + "&listType=11&mine=1&synckey=0&listMode=0");
        window.close();
    }, false);
}

var bg = chrome.extension.getBackgroundPage();
var userVid = bg.getuserVid();
var bookId = bg.getbookId();
document.getElementById("bookId").innerHTML = "bid：" + bookId;
document.getElementById("userVid").innerHTML = "vid：" + userVid;
if(userVid == "null"){//当未获得userVid
    console.log("出错：userVid == \"null\"");
}
if(bookId == "null"){
    console.log("出错：bookId == \"null\"");
}
var getText = document.getElementById("getComment_text");
var getHtml = document.getElementById("getComment_html");
var getComment = document.getElementById("getComment");
var choose = document.getElementById("choose");
var isInChoose = false;
//鼠标进入getComment
getComment.onmouseenter = function(){
    choose.style.display = "block";
    getText.style.display = "block";
    getHtml.style.display = "block";
}
choose.onmouseenter = function(){
    isInChoose = true;
    choose.style.display = "block";
    getText.style.display = "block";
    getHtml.style.display = "block";
}
choose.onmouseleave = function(){
    isInChoose = false;
    choose.style.display = "none";
    getText.style.display = "none";
    getHtml.style.display = "none";
}
/*鼠标离开getComment时的事件处理*/
getComment.onmouseleave = function() {
    if(isInChoose == false && choose.style.display == "block"){
        choose.style.display = "none";
        getText.style.display = "none";
        getHtml.style.display = "none";
    }
}