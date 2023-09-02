import $ from "jquery"
/* prompt 弹窗初始化 */
function initPrompt() {
	// prompt 取消
	$("#promptCancelButton")[0].onclick = function() {
		$("#promptInput").val('').attr('placeholder', '')
		$("#promptContainer").css('display', 'none')
	}
	// 监听按键
	$("#promptInput")[0].onkeyup = event => {
		// Enter 确定
		if (event.code == "Enter") {
			console.log('#promptInput Enter keyup')
			$("#promptConfirmButton").trigger('click')
			return false
		}
		// Escape 取消
		if (event.code == "Escape") {
			$("#promptCancelButton").trigger('click')
		}
	}
}

export {initPrompt}