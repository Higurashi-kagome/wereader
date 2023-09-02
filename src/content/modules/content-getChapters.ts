/* 用于获取书本目录信息 */
import $ from 'jquery';

/**
 * 监听从背景页发过来的消息，如果是需要获取章节信息，则从 dom 中获取相关信息，并返回给背景页
 */
export type responseType = {chapters: {title: string, level: number}[], currentContent: string};
function initGetChapInfo() {
	console.log('initGetChapInfo');
	chrome.runtime.onMessage.addListener((request, sender, sendResponse)=>{
		const response: responseType = {chapters: [], currentContent: ""};
		console.log('收到请求', request);
		if(!request.isGetChapters) return;
		try{
			/* 获取书本各章节标题 */
			$('.chapterItem>:first-child').each((idx, el)=>{
				const $el = $(el);
				const className: string = $el.attr('class')!;
				const level: number = parseInt(className.charAt(className.length - 1));
				const chapTitle: string = $el.find('.chapterItem_text').text();
				// 获取目录
				response.chapters.push({title: chapTitle, level: level});
			});
			/* 获取当前章节标题 */
			let currentTitle: string = "";
			if($(".readerTopBar_title_chapter").length){
				// 阅读页中的当前章节标题。可能存在空格，所以添加正则替换开头和结尾的空格
				currentTitle = $(".readerTopBar_title_chapter").text().replace(/(^\s*|\s*$)/, '');
			}else{
				// 目录中的当前章节标题
				currentTitle = $(".chapterItem.chapterItem_current").text();
			}
			response.currentContent = currentTitle;
		}catch{
			console.error("contents-getChapters.js：获取目录失败")
		}
		sendResponse(response);
	});
}

export { initGetChapInfo };