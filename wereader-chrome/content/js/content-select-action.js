// 点击
let clickTarget = (callback) => {
	const storageKey = 'selectAction';
	chrome.storage.sync.get([storageKey], function(setting){
		let underlineBtn = document.getElementsByClassName(`toolbarItem ${setting[storageKey]}`)[0]
		if(setting[storageKey] != "underlineNone" && underlineBtn){
			underlineBtn.click()
		}
		//重新监听
		if (callback) callback();
	})
}

// 标注面板的监听函数：在标注面板属性值改变时调用
let onToolbarAttrChanged =  (mutationsList, observer)=>{
	for(let mutation of mutationsList) {
		if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
			let container = $('.reader_toolbar_container');
			//如果选中了文字
			if(container.length && container.css('display') == 'block' && $('.wr_selection')[0]) {
				// 结束监听以防止监听面板消失时触发自动标注
				observer.disconnect();
				// 点击目标，并在回调函数中重新监听
				clickTarget(observeToolbar);
			}
		}
	}
}


//为标注面板（readerToolbarContainer）添加监听函数
let observeToolbar = ()=>{
	let readerToolbarContainer = document.getElementsByClassName('reader_toolbar_container')[0];
	if(!readerToolbarContainer) {
		window.setTimeout(observeToolbar, 500);
		return;
	}
	// 监听属性 style 变化
	let toolbarAttrObserver = new MutationObserver(onToolbarAttrChanged);
	toolbarAttrObserver.observe(readerToolbarContainer, {'attributes': true});
}

// 标注面板的父元素出现后调用
let onParentShow = (readerToolbarContainer)=>{
	// 标注面板出现
	let container = $(readerToolbarContainer);
	// 如果选中了文字
	if(container.length && container.css('display') == 'block' && $('.wr_selection').length)
		clickTarget();
	// 开始监听标注面板
	if(container.length) observeToolbar();
}
// 在第一次使用标注之前，页面中不存在 readerToolbarContainer，这导致第一次标注时不会触发自动标注
// 所以使用该函数设置对 readerToolbarContainer 的父元素（renderTargetContainer）的监听
let observeParent =  ()=>{
	const parent = '.renderTargetContainer';
	const listenFor = '.reader_toolbar_container';
	if ($(listenFor).length) return; // 已经存在则不调用
	$(parent).unbindArrive(listenFor);
	$(parent).arrive(listenFor, onParentShow);
}

// 使用扩展通知来处理切换章节后失效的问题
chrome.runtime.onMessage.addListener(function(msg){
	if(!msg.isSelectAction) return;
	observeParent();
});