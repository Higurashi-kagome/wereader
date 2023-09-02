/* 用于实现进度查看 */
import Swal from 'sweetalert2'

import { loadCSS } from './content-utils'

function initScrollBar() {
	console.log('initScrollBar')
	window.addEventListener('load',() => {
		//添加进度查看按钮并绑定点击事件
		function addProgressBtn() {
			//设置按钮
			const progressBtn = document.createElement("button")
			const btnDiv = document.getElementsByClassName("readerControls readerControls")[0]
			const appCode = document.getElementsByClassName("readerControls_item download")[0] as HTMLElement
			if(!appCode || !btnDiv) return
			btnDiv.insertBefore(progressBtn, appCode)
			appCode.style.display = "none"
			progressBtn.setAttribute("title", "进度")
			progressBtn.setAttribute("class","readerControls_item download")
			//设置按钮文字
			const progressText = document.createElement("span")
			progressText.textContent = "进度"
			progressText.id = "progressText"
			progressBtn.appendChild(progressText)
			
			// 隐藏滚动条
			loadCSS("content/static/css/content-hideScroll.css", 'wereader-scrollbar-style-el')

			//绑定点击事件
			let count = -1
			progressBtn.addEventListener('click', function() {
				try {
					//切换滚筒条显隐
					const cssFile = (count === -1) ? "content/static/css/showScroll.css" : "content/static/css/content-hideScroll.css"
					loadCSS(cssFile, 'wereader-scrollbar-style-el')
					count = count * (-1)
				} catch (error) {
					Swal.fire({title: "Oops...",text: "似乎出了点问题，刷新一下试试吧~",icon: "error",confirmButtonText: 'OK'})
				}
			},false)
		}
		//尝试获取 app 下载按钮
		const appDownload = document.getElementsByClassName("readerControls_item download")[0] as HTMLElement
		if(appDownload != undefined && appDownload.style.display != "none") addProgressBtn()
	})
}

export { initScrollBar }