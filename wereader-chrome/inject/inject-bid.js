/* 用于获取bid */

//console.log("inject-bid.js：被注入");
function getClass(classname){
	if (document.getElementsByClassName) {
        //使用现有方法
		return document.getElementsByClassName(classname);
	}else{
		//定义一个数组放classname
		var results = new Array();
		//获取所有节点元素
		let elem = document.getElementsByTagName("*");
		for (var i = 0; i < elem.length; i++) {
			if (elem[i].className.indexOf(classname) != -1) {
				results[results.length] = elem[i];
			}
		}
		return results;
	}
}

var element = getClass("wr_bookCover_img")
var list = element.item(0).src.split("/")
var bookId = list[list.length - 2]
chrome.runtime.sendMessage({type: "bookId", bid: bookId})