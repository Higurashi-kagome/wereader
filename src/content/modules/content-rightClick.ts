import { noteSelector } from "../../common/constants"
import { mouseMoveTarget } from "./content-mousemove"
import $ from "jquery"

function initRightClick() {
	console.log('initRightClick')
	// 解除右键限制
	window.addEventListener("contextmenu",function(t) {
		t.stopImmediatePropagation()
	},true)

	// 鼠标按下事件：点击右键时保存光标下的当前元素
	let clickedEl: HTMLElement
	$(document).on('mousedown', (event) => {
		// 右键为 3
		if (3 == event.which) clickedEl = mouseMoveTarget  // mouseMoveTarget 在 keyBind 中获取到
	})
	// 鼠标按下事件：点击右键后更新标注
	$(document).on('mousedown', (event) => {
		if (3 == event.which) { // 右键为 3
			// fix：在按下 Ctrl 标注元素消失后右击鼠标，在松开 Ctrl 时标注将不会恢复显示
			setTimeout(() => {$(noteSelector).css('display','block')}, 500)
		} else if (1 == event.which) { /* 左键为 1 */ }
	})

	// 监听消息，发送 DOM 元素到背景页，实现右键复制
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if(request == "getClickedEl") {
			// 不知道为什么，测试时直接传 mouseMoveTarget 过去常常为 {}，所以选择转成 html 字符串传
			const data = { clickedEl: clickedEl.outerHTML, originClickedEl: clickedEl }
			// 想法包含换行时，换行符在背景页不能正确获取，所以直接传文本
			if ($(clickedEl).is('.readerReviewDetail_item>.content')) Object.assign(data, {copy: true, clickedElText: clickedEl.outerText})
			sendResponse(data)
		}
	})
}

export {initRightClick}
