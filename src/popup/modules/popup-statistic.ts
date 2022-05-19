import $ from "jquery";
import { bg } from "./popup-utils";

// 统计按钮点击事件
function initStatisticsTab() {
	let statistic = $('#statisticBtn');
	if(bg.Config.enableStatistics){
		// 新创建
		if (!statistic.length) {
			statistic = $(`<button class="tabLinks" id="statisticBtn">统计</button>`);
			statistic.appendTo('.tab').on('click', ()=>{
				chrome.tabs.create({url: chrome.runtime.getURL('statistics.html')});
			});
		}
	} else {
		statistic.hide();
	}
}

export {initStatisticsTab};