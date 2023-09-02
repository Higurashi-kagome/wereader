import $ from "jquery";
import { popupApi } from "./popup-utils";

// 统计按钮点击事件
async function initStatisticsTab() {
	let statistic = $('#statisticBtn');
	const config = await popupApi.Config()
	if(config.enableStatistics){
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