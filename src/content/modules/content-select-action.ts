import $ from 'jquery'

import { SelectActionOptions } from '../../worker/worker-vars'
import { hideToolbar, hideSelection } from './content-hide'

function initSelectAction() {
	console.log('initSelectAction')
	// 点击元素
	// eslint-disable-next-line @typescript-eslint/ban-types
	const clickTarget = (callback?: Function) => {
		// Ctrl 按键按下时不点击
		// TODO 支持按照禁用时的点击选项改变选中后动作
		if(window.pressedKeys.get(17)) {
			if (callback) callback()
			return
		}
		const storageKey = 'selectAction'
		chrome.storage.sync.get([storageKey], function(setting) {
			const underlineBtn = document.getElementsByClassName(`toolbarItem ${setting[storageKey]}`)[0] as HTMLElement
			if(setting[storageKey] != SelectActionOptions.None && underlineBtn){
				underlineBtn.click()
				hideToolbar()
				hideSelection()
			}
			//重新监听
			if (callback) callback()
		})
	}

	// 标注面板的监听函数：在标注面板属性值改变时调用
	const onToolbarAttrChanged =  (mutationsList: MutationRecord[], observer: MutationObserver) => {
		console.log('Toolbar 属性改变')
		for(const mutation of mutationsList) {
			if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
				const container = $('.reader_toolbar_container')
				//如果选中了文字
				if(container.length && container.css('display') == 'block' && $('.wr_selection')[0]) {
					// 结束监听以防止监听面板消失时触发自动标注
					observer.disconnect()
					// 点击目标，并在回调函数中重新监听
					console.log('属性监听器监听到触发条件')
					clickTarget(observeToolbar)
				}
			}
		}
	}

	//为标注面板（readerToolbarContainer）添加监听函数
	let toolbarAttrObserver: MutationObserver
	const observeToolbar = () => {
		const readerToolbarContainer = document.getElementsByClassName('reader_toolbar_container')[0]
		if(!readerToolbarContainer) {
			window.setTimeout(observeToolbar, 500)
			return
		}
		// 监听属性 style 变化
		if (toolbarAttrObserver) toolbarAttrObserver.disconnect() // 设为全局变量，确保只有一个监听器
		toolbarAttrObserver = new MutationObserver(onToolbarAttrChanged)
		toolbarAttrObserver.observe(readerToolbarContainer, {'attributes': true})
	}

	window.addEventListener('load', () => {
		/**
		 * 在第一次使用标注之前，页面中不存在 .reader_toolbar_container，
		 * 使用该函数设置对 .reader_toolbar_container 的父元素（.renderTargetContainer）进行监听。
		 */
		const p = '.renderTargetContainer'
		const observeParent =  function() {
			const parentObserver = new MutationObserver((mutationsList: MutationRecord[]) => {
				for(const mutation of mutationsList) {
					if (mutation.type === 'childList') {
						const container = $('.reader_toolbar_container')
						// 选中了文字则点击面板按钮
						if(container.length && container.css('display') == 'block' && $('.wr_selection').length) {
							// 标注面板出现
							console.log('父容器监听器监听到触发事件')
							clickTarget()
						}
						// 开始监听标注面板
						if(container.length) observeToolbar()
					}
				}
			})
			parentObserver.observe($(p)[0], {'childList': true})
		}
		observeParent()
		// 处理切换章节后失效的问题
		$('.app_content')[0].arrive('.readerChapterContent', () => {
			observeParent()
		})
	})
}

export { initSelectAction }