// 统计按钮点击事件
if(bg.Config.enableStatistics){
	const statistic = $(`<button class="tabLinks" id="statisticBtn">统计</button>`);
	$('.tab').append(statistic);
	statistic.show().click(()=>{
		chrome.tabs.create({url: chrome.runtime.getURL('popup/statistics/statistics.html')});
	});
}