window.onload=function(){
    //获取书评
    document.getElementById("getComment").addEventListener('click', function(){
        var bg = chrome.extension.getBackgroundPage();
        bg.get.getComment("https://i.weread.qq.com/review/list?listType=6&userVid=" + userVid + "&rangeType=2&mine=1&listMode=1");
    }, false);
    //获取标注
    document.getElementById("getBookMarks").addEventListener('click', function(){
        var bg = chrome.extension.getBackgroundPage();
        bg.getData("https://i.weread.qq.com/book/bookmarklist?bookId=" + bookId);
    }, false);
    //获取目录
    document.getElementById("getBookContents").addEventListener('click', function(){
        var bg = chrome.extension.getBackgroundPage();
        bg.getData("https://i.weread.qq.com/book/bookmarklist?bookId=" + bookId);
    }, false);
    //获取热门标注
    document.getElementById("getBestBookMarks").addEventListener('click', function(){
        var bg = chrome.extension.getBackgroundPage();
        bg.getData("https://i.weread.qq.com/book/bestbookmarks?bookId=" + bookId);
    }, false);
    //获取我的想法
    document.getElementById("getMyThoughts").addEventListener('click', function(){
        var bg = chrome.extension.getBackgroundPage();
        bg.getData("https://i.weread.qq.com/review/list?bookId=" + bookId + "&listType=11&mine=1&synckey=0&listMode=0");
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
