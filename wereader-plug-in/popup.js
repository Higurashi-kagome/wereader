window.onload=function(){
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
        var bg = chrome.extension.getBackgroundPage();
        bg.getComment("https://i.weread.qq.com/review/list?listType=6&userVid=" + userVid + "&rangeType=2&mine=1&listMode=1",bookId,false);
        window.close();
    }, false);
    //HTML
    document.getElementById("getComment_html").addEventListener('click', function(){
        var bg = chrome.extension.getBackgroundPage();
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
        var bg = chrome.extension.getBackgroundPage();
        bg.getBookMarks("https://i.weread.qq.com/book/bookmarklist?bookId=" + bookId,false);
        window.close();
    }, false);
    //全部
    document.getElementById("getAll").addEventListener('click', function(){
        var bg = chrome.extension.getBackgroundPage();
        bg.getBookMarks("https://i.weread.qq.com/book/bookmarklist?bookId=" + bookId,true);
        window.close();
    }, false);
    //获取目录
    document.getElementById("getBookContents").addEventListener('click', function(){
        var bg = chrome.extension.getBackgroundPage();
        bg.getBookContents();
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
        bg.getMyThought("https://i.weread.qq.com/review/list?bookId=" + bookId + "&listType=11&mine=1&synckey=0&listMode=0");
        window.close();
    }, false);
}

var getText = document.getElementById("getComment_text");
var getHtml = document.getElementById("getComment_html");
var getThisChapter = document.getElementById("getThisChapter");
var getAll = document.getElementById("getAll");

var choose = document.getElementById("choose");
var chooseMark = document.getElementById("choose_mark");

var bg = chrome.extension.getBackgroundPage();
var userVid = bg.getuserVid();
var bookId = bg.getbookId();
document.getElementById("bookId").innerHTML = "bid：" + bookId;
document.getElementById("userVid").innerHTML = "vid：" + userVid;
if(document.getElementById("userVid").innerHTML == "vid：null"){//当未获得userVid
    alert("userVid == \"null\"，请重试");
}
if(document.getElementById("bookId").innerHTML == "bid：null"){
    alert("bookId == \"null\"，请重试");
}