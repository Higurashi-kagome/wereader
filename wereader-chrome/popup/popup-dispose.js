/* 绑定标签页按钮点击事件、下拉按钮点击事件、书架刷新按钮点击事件并移除不该在当前页面出现的内容 */

// tab 按钮点击事件
function tabClickEvent(){
	/* 隐藏 .tabContent、去除 .tabLinks 的 active 类  */
	$('.tabContent').hide();
	$('.tabLinks').removeClass('active');
	/* 显示当前 tab 内容，将当前 tab 按钮设置为 active */
	$(`.tabContent[data-for='${$(this).attr('id')}']`).show();
	$(this).addClass('active');
}

// 下拉按钮点击事件
function dropdownClickEvent(){
	$(this).toggleClass("active");
	$(this).next().toggle();
}

chrome.tabs.query({ active: true, currentWindow: true }, async tabs => {
	// 不在读书页时移除笔记及开发者选项
	const isReading = /:\/\/weread\.qq\.com\/web\/reader\/[^\s]*/.test(tabs[0].url);
	if(isReading) {
		await noteTab();
		if (bg.Config.enableDevelop) testTab();
	}
	// tab 按钮点击事件，默认打开第一个 tab
	$('.tabLinks').click(tabClickEvent).eq(0).click();
	// note 中下拉按钮点击事件
	$('.vertical-menu[data-for="noteBtn"] .dropdown-btn').click(dropdownClickEvent);
});