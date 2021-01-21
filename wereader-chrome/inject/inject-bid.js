/* 用于获取bid */

//console.log("inject-bid.js：被注入");
(function(){
	let element = document.getElementsByClassName("wr_bookCover_img");
	let list = element.item(0).src.split("/")
	let bookId = list[list.length - 2]
	chrome.runtime.sendMessage({type: "bookId", bid: bookId})
})()