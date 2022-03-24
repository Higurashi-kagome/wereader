// 绑定 esc 事件
$(document).keydown(function (event) {
	let fancybox = $('.fancybox-overlay');
	let thoughtPanel = $('.readerWriteReviewPanel'); // 想法发布面板
	let thoughtReview = $('#readerReviewDetailPanel'); // 想法浏览面板
	let reader_toolbar = $('.reader_toolbar_container'); // 标注面板
	if (event.keyCode == 27) {
		if (fancybox.length) fancybox.remove();
		if (thoughtPanel.length && thoughtPanel.css('display') !== 'none') $('.closeButton').click();
		if (thoughtReview.length && thoughtReview.parent().css('display') !== 'none')$('body').click();
		if (reader_toolbar.length && reader_toolbar.css('display') !== 'none') reader_toolbar.remove();
	}
});

/* 在图片或代码被标注的时候不能够显示复制按钮，所以下面的代码将会监听 Ctrl 键，Ctrl 键按下时鼠标下的标注元素
将被隐藏，此时复制按钮就能够正常使用 */
// 保存按下按键信息
var pressedKeys = {};
// 保存鼠标位置、鼠标下的元素
var mousePagePosition = {};
var mouseClientPosition = {};
var mouseMoveTarget;

// 鼠标移动事件：获取鼠标位置、鼠标下的元素
function documentMouseMove(event) {
	// Store mouse position
	mousePagePosition = {top:event.pageY, left:event.pageX};
	mouseClientPosition = {top:event.clientY, left:event.clientX};
	mouseMoveTarget = event.target;
}

// 按键（Ctrl）按下事件：隐藏底部的标注
function documentKeyDown(event) {
	pressedKeys[event.keyCode] = true;
	if(pressedKeys[17]) {
		if(/wr_(myNote|underline)/.test(mouseMoveTarget.className)){
			mouseMoveTarget.style.display = 'none';
		}
	}
}

// 按键（Ctrl）抬起事件：显示标注
function documentKeyUp(event) {
	pressedKeys[event.keyCode] = false;
	if(event.keyCode == 17) {
		$('.wr_underline,.wr_myNote').css('display','block');
	}
}

$(document).mousemove(documentMouseMove).keydown(documentKeyDown).keyup(documentKeyUp);