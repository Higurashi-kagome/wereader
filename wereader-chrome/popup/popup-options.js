// 选项页
if(bg.Config.enableOption){
	const option = $(`<button class="tabLinks" id="openOption">选项</button>`);
	$('.tab').append(option);
	option.click(()=>{ chrome.runtime.openOptionsPage(); });
}