import $ from 'jquery';

import { tabClickEvent } from './popup-tabs';
import {
	bg,
	dropdownClickEvent,
	readPageRegexp,
} from './popup-utils';

/* 初始化笔记面板，为各个按钮绑定点击事件 */
async function initNoteTab(url: string) {
	// 在读书页时才显示笔记
	if(!readPageRegexp.test(url)) return;
	let bookId = await bg.setBookId();
	if(!bookId) return window.close();
	const userVid = await bg.getUserVid();
	console.log('bookId', bookId);
	console.log('userVid', userVid);
	if (!userVid) {
		bg.alert('信息获取失败，请确保正常登陆后刷新重试');
		return window.close();
	}
	$(`<button class="tabLinks" id="noteBtn">笔记</button>`).prependTo($('.tab')).on('click', tabClickEvent);
	// 功能入口
	$('.caller').on('click', listener);
	// 下拉按钮点击事件
	$('.vertical-menu[data-for="noteBtn"] .dropdown-btn').on('click', dropdownClickEvent);
	// 点击调用该函数
	function listener(event: JQuery.ClickEvent){
		let targetEl = event.target;
		switch(targetEl.id){
			case "getTextComment":
				bg.copyComment(userVid, false)
				break;
			case "getHtmlComment":
				bg.copyComment(userVid, true)
				break;
			case "getMarksInCurChap":
				bg.copyBookMarks(false)
				break;
			case "getAllMarks":
				bg.copyBookMarks(true)
				break;
			case "getContents":
				bg.copyContents()
				break;
			case "getBestBookMarks":
				bg.copyBestBookMarks()
				break;
			case "getMyThoughtsInCurChap":
				bg.copyThought(false)
				break;
			case "getAllMyThoughts":
				bg.copyThought(true)
				break;
			case "removeMarksInCurChap":
				bg.sendMessageToContentScript({message:{deleteBookmarks:true, isAll: false}});
				break;
			case "removeAllMarks":
				bg.sendMessageToContentScript({message:{deleteBookmarks:true, isAll: true}});
				break;
			case "copyBookInfo":
				bg.copyBookInfo();
				break;
			default:
				break;
		}
		window.close();
	}
}

export { initNoteTab };