import $ from "jquery";

function initSelectAction() {
	console.log('initSelectAction');
	// 点击元素
	let clickTarget = (callback?: Function) => {
		const storageKey = 'selectAction';
		chrome.storage.sync.get([storageKey], function(setting){
			let underlineBtn = document.getElementsByClassName(`toolbarItem ${setting[storageKey]}`)[0] as HTMLElement;
			if(setting[storageKey] != "underlineNone" && underlineBtn){
				underlineBtn.click()
			}
			//重新监听
			if (callback) callback();
		})
	}

	// 标注面板的监听函数：在标注面板属性值改变时调用
	let onToolbarAttrChanged =  (mutationsList: MutationRecord[], observer: MutationObserver)=>{
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
	var toolbarAttrObserver: MutationObserver;
	let observeToolbar = ()=>{
		let readerToolbarContainer = document.getElementsByClassName('reader_toolbar_container')[0];
		if(!readerToolbarContainer) {
			window.setTimeout(observeToolbar, 500);
			return;
		}
		// 监听属性 style 变化
		if (toolbarAttrObserver) toolbarAttrObserver.disconnect(); // 设为全局变量，确保只有一个监听器
		toolbarAttrObserver = new MutationObserver(onToolbarAttrChanged);
		toolbarAttrObserver.observe(readerToolbarContainer, {'attributes': true});
	}

	window.addEventListener('load', ()=>{
		/**
		 * 在第一次使用标注之前，页面中不存在 .reader_toolbar_container，
		 * 使用该函数设置对 .reader_toolbar_container 的父元素（.renderTargetContainer）进行监听。
		 */
		let observeParent =  function() {
			const p = '.renderTargetContainer';
			const listenFor = '.reader_toolbar_container';
			if ($(listenFor).length) return; // 已经存在则不调用
			$(p)[0].unbindArrive(listenFor);
			/* 监听到父元素 .renderTargetContainer 中出现了 .reader_toolbar_container，则自动标注，
			并初始化对 .reader_toolbar_container 的监听 */
			$(p)[0].arrive(listenFor, function (readerToolbarContainer: Element) {
				// 标注面板出现
				let container = $(readerToolbarContainer);
				// 选中了文字则点击面板按钮
				if(container.length && container.css('display') == 'block' && $('.wr_selection').length)
					clickTarget();
				// 开始监听标注面板
				if(container.length) observeToolbar();
			});
		}
		observeParent();
		// 处理切换章节后失效的问题
		$('.app_content')[0].arrive('.readerChapterContent', ()=>{
			observeParent();
		});
	});
}

export {initSelectAction};