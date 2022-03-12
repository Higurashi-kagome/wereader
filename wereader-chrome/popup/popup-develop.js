/* 从背景页获取用于测试的函数后，在 popup 页面上创建开发者选项面板，方便调用测试函数 */
function testTab() {
	// 检查是否开启开发者选项
	if(!bg.Config.enableDevelop) return;
	const devFuncs = bg.getTest();
	let testContent = $(`<div class='tabContent vertical-menu' data-for='testBtn'></div>`);
	for(const funcName in devFuncs){
		let el = $(`<a>${funcName}</a>`);
		el.on('click', ()=>{
			devFuncs[funcName]();
			window.close();
		});
		testContent.append(el);
	}
	$('.tab').append($(`<button class='tabLinks' id='testBtn'>开发者选项</button>`));
	// script 标签在 body 标签最后
	$('script:first-of-type').before(testContent);
}