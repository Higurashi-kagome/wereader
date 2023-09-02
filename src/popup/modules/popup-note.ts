import $ from 'jquery';

import { tabClickEvent } from './popup-tabs';
import {
	popupApi,
	dropdownClickEvent,
	readPageRegexp,
} from './popup-utils';

/* 初始化笔记面板，为各个按钮绑定点击事件 */
async function initNoteTab(url: string) {
	// 在读书页时才显示笔记
	if(!readPageRegexp.test(url)) return;
	const bookId = await popupApi.setBookId();
	if(!bookId) return window.close();
	const userVid = await popupApi.getUserVid();
	console.log('bookId', bookId);
	console.log('userVid', userVid);
	if (!userVid) {
		popupApi.notify('信息获取失败，请确保正常登陆后刷新重试');
		return window.close();
	}
	$(`<button class="tabLinks" id="noteBtn">笔记</button>`).prependTo($('.tab')).on('click', tabClickEvent);
	// 功能入口
	$('.caller').on('click', listener);
	// 下拉按钮点击事件
	$('.vertical-menu[data-for="noteBtn"] .dropdown-btn').on('click', dropdownClickEvent);
	// 点击调用该函数
	function listener(event: JQuery.ClickEvent){
		const targetEl = event.target;
		switch(targetEl.id){
			case "getTextComment":
				popupApi.copyComment(userVid, false)
				break;
			case "getHtmlComment":
				popupApi.copyComment(userVid, true)
				break;
			case "getMarksInCurChap":
				popupApi.copyBookMarks(false)
				break;
			case "getAllMarks":
				popupApi.copyBookMarks(true)
				break;
			case "getContents":
				popupApi.copyContents()
				break;
			case "getBestBookMarks":
				popupApi.copyBestBookMarks()
				break;
			case "getMyThoughtsInCurChap":
				popupApi.copyThought(false)
				break;
			case "getAllMyThoughts":
				popupApi.copyThought(true)
				break;
			case "removeMarksInCurChap":
				popupApi.sendMessageToContentScript({message:{deleteBookmarks:true, isAll: false}});
				break;
			case "removeAllMarks":
				popupApi.sendMessageToContentScript({message:{deleteBookmarks:true, isAll: true}});
				break;
			case "copyBookInfo":
				popupApi.copyBookInfo();
				break;
			default:
				break;
		}
		window.close();
	}
}

export { initNoteTab };