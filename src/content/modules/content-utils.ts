/* 保存供其他 content.js 调用的函数 */
import $ from 'jquery'
import Swal, { SweetAlertOptions } from 'sweetalert2'

/* 模拟点击 */
function simulateClick(element: HTMLElement, init = {}): void {
	const clientRect = element.getBoundingClientRect()
	const clientX = clientRect.left
	const clientY = clientRect.top
	const position = { clientX: clientX, clientY: clientY }
	Object.assign(init, position)
	const mouseEvent = new MouseEvent("click", init)
	element.dispatchEvent(mouseEvent)
}

/* 获取当前目录 */
function getCurrentChapTitle(): string {
	let currentChapTitle: string = ''
	if($(".readerTopBar_title_chapter").length){
		currentChapTitle = $(".readerTopBar_title_chapter").text()
	}else{
		currentChapTitle = $(".chapterItem.chapterItem_current").text()
	}
	currentChapTitle = currentChapTitle.replace(/^\s*|\s*$/,'')
	return currentChapTitle
}

/* sleep(millisecond) */
function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms))
}

/** sweetAlert2 弹窗通知。
 * msg.alertMsg.icon 为 success 或 warning 类型时，比如 msg={icon: 'success',title: '复制成功'}
 * 将在右上角弹出小方框，否则根据 msg.alertMsg 的配置来弹窗，
 * 比如 msg={title: "复制出错", text: JSON.stringify(e), confirmButtonText: '确定',icon: "error"}
 * */
type alertMsgType = {isAlertMsg?: boolean, alertMsg: SweetAlertOptions};
function mySweetAlert(msg: alertMsgType) {
	if(msg.alertMsg && (msg.alertMsg.icon == 'success' || msg.alertMsg.icon == 'warning')){
		const Toast = Swal.mixin({
			toast: true,
			position: 'top-end',
			showConfirmButton: false,
			timer: 1500,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			onOpen: (toast: { addEventListener: (arg0: string, arg1: any) => void; }) => {
				toast.addEventListener('mouseenter', Swal.stopTimer)
				toast.addEventListener('mouseleave', Swal.resumeTimer)
			}
		})
		Toast.fire(msg.alertMsg)
	}else{//其他消息
		Swal.fire(msg.alertMsg)
	}
}

/* 复制文本内容 */
async function copy(targetText: string): Promise<void> {
	try {
		await navigator.clipboard.writeText(targetText)
		mySweetAlert({alertMsg: {icon: 'success', title: '复制成功'}})
	} catch (err) {
		console.error('Failed to copy: ', err)
		console.error("targetText", targetText)
		mySweetAlert({alertMsg: {text: "复制出错", icon: 'warning'}})
	}
}

/**
 * 通过 link 元素加载样式文件到网页，以扩展 id 作为类名
 * @param file 文件路径，比如"theme/white.css"
 * @param elementId 设置给 link 元素的 id 值，已存在该 id 的元素时将移除原元素，再将 elementId 作为新元素 id 设置
 * @returns 返回插入后的元素
 */
// ========== https://stackoverflow.com/a/19127555 ==========
function loadCSS(file: string, elementId?: string | undefined) {
	const filePath = chrome.runtime.getURL(file)
	const link = document.createElement("link")
	link.type = "text/css"
	link.rel = "stylesheet"
	link.href = filePath
	const extId = filePath.match(/(?<=\/\/)([^/]*)/)![0]!
	link.classList.add(extId)
	// 如果 id 存在，直接移除原元素
	if(elementId) unloadCSS(elementId)
	// 如果传入了 elementId，则将其设置为元素 id
	if (elementId) link.id = elementId
	document.getElementsByTagName("head")[0].appendChild(link)
	return link
}

function unloadCSS(elementId: string) {
	// 如果 id 存在，直接移除原元素
	if (elementId && document.getElementById(elementId)) $('#' + elementId).remove()
}

export {
	alertMsgType,
	copy,
	getCurrentChapTitle,
	loadCSS,
	unloadCSS,
	mySweetAlert,
	simulateClick,
	sleep,
}