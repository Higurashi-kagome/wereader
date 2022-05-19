import './popup/static/css/popup.css';

/* 绑定标签页按钮点击事件、下拉按钮点击事件、书架刷新按钮点击事件并移除不该在当前页面出现的内容 */
import $ from 'jquery';

import { initTestTab } from './popup/modules/popup-develop';
import { initNoteTab } from './popup/modules/popup-note';
import { initOptionsTab } from './popup/modules/popup-options';
import { initShelfTab } from './popup/modules/popup-shelf';
import { initStatisticsTab } from './popup/modules/popup-statistic';

chrome.tabs.query({ active: true, currentWindow: true }, async tabs => {
	initShelfTab();
	initStatisticsTab();
	initOptionsTab();
	const url = tabs[0].url!;
	await initNoteTab(url);
	initTestTab(url);
	// 默认点击第一个 tab
	$('.tabLinks').eq(0).trigger('click');
});