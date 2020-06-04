window.onload=function(){
    document.getElementById("markSure1").addEventListener('click', function(){
        bookId = document.getElementById('bookId').value;
    }, false);
    document.getElementById("markSure2").addEventListener('click', function(){
        userVid = document.getElementById('userVid').value;
    }, false);
    //获取评论
    document.getElementById("getComment").addEventListener('click', function(){
        var bg = chrome.extension.getBackgroundPage();
		bg.get.getComment("https://i.weread.qq.com/review/list?listType=6&userVid=" + userVid + "&rangeType=2&mine=1&listMode=1");
    }, false);
    //获取书架
    document.getElementById("getShelf").addEventListener('click', function(){
        var bg = chrome.extension.getBackgroundPage();
		bg.getData("https://i.weread.qq.com/shelf/sync?userVid=" + userVid + "&synckey=0&lectureSynckey=0");
    }, false);
    //获取标注
    document.getElementById("getBookMarks").addEventListener('click', function(){
        var bg = chrome.extension.getBackgroundPage();
		bg.getData("https://i.weread.qq.com/book/bookmarklist?bookId=" + bookId);
    }, false);
    //获取热门标注
    document.getElementById("getBestBookMarks").addEventListener('click', function(){
        var bg = chrome.extension.getBackgroundPage();
		bg.getData("https://i.weread.qq.com/book/bestbookmarks?bookId=" + bookId);
    }, false);
    //获取想法
    document.getElementById("getMyThoughts").addEventListener('click', function(){
        var bg = chrome.extension.getBackgroundPage();
		bg.getData("https://i.weread.qq.com/review/list?bookId=" + bookId + "&listType=11&mine=1&synckey=0&listMode=0");
    }, false);
    //登录
    document.getElementById("login").addEventListener('click', function(){
        var bg = chrome.extension.getBackgroundPage();
		bg.newPage("https://weread.qq.com/#login");
    }, false);
}

var bookId = '912326';
//var userVid = '316245418';
var bg = chrome.extension.getBackgroundPage();
var userVid = bg.isLogin();
console.warn(userVid);
var test = bg.test();
console.warn(test);
if(userVid == null){
    document.getElementById("login").style.display = "block";
}else{
    document.getElementById("bookId").style.display = "block";
    document.getElementById("markSure1").style.display = "block";
    document.getElementById("userVid").style.display = "block";
    document.getElementById("markSure2").style.display = "block";
    document.getElementById("getComment").style.display = "block";
    document.getElementById("getShelf").style.display = "block";
    document.getElementById("getBookMarks").style.display = "block";
    document.getElementById("getBestBookMarks").style.display = "block";
    document.getElementById("getMyThoughts").style.display = "block";
    console.warn(userVid);
}