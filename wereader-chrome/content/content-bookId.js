// console.log('content-bookId.js：注入');
chrome.runtime.onMessage.addListener((request, sender, sendResponse)=>{
    if(!request.getBookId) return;
    let elements = document.getElementsByClassName("wr_bookCover_img");
	let list = elements.item(0).src.split("/");
	let bookId = list[list.length - 2];
	sendResponse(bookId);
});