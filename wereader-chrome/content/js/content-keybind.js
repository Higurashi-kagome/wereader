// 绑定 esc 事件
$(document).keydown(function (event) {
	let fancybox = $('.fancybox-overlay');
	// 想法发布面板
	let thoughtPanel = $('.readerWriteReviewPanel');
	// 想法浏览面板
	let thoughtReview = $('#readerReviewDetailPanel');
	/* TODO：与想法浏览面板同时显示的标注面板 */
	if (event.keyCode == 27) {
		if (fancybox.length) fancybox.remove();
		if (thoughtPanel.length && thoughtPanel.css('display') !== 'none') $('.closeButton').click();
		if (thoughtReview.length) $('body').click();
	}
});

/* 在图片或代码被标注的时候不能够显示复制按钮，所以下面的代码将会监听 Ctrl 键，Ctrl 键按下时鼠标下的标注元素
将被隐藏，此时复制按钮就能够正常使用 */
var pressedKeys = {};
var mousePagePosition = {};
var mouseClientPosition = {};
var mouseMoveTarget;

function documentMouseMove(event) {
	// Store mouse position
	mousePagePosition = {top:event.pageY, left:event.pageX};
	mouseClientPosition = {top:event.clientY, left:event.clientX};
	mouseMoveTarget = event.target;
}

function documentKeyDown(event) {
	pressedKeys[event.keyCode] = true;
	if(pressedKeys[17]) {
		if(/wr_(myNote|underline)/.test(mouseMoveTarget.className)){
			mouseMoveTarget.style.display = 'none';
		}
	}
}

function documentKeyUp(event) {
	pressedKeys[event.keyCode] = false;
	if(event.keyCode == 17) {
		$('.wr_underline,.wr_myNote').css('display','block');
	}
}

// 在按下 Ctrl 标注元素消失后右击鼠标，在松开 Ctrl 时标注将不会恢复显示，所以在此处监听右键
$(document).mousemove(documentMouseMove).keydown(documentKeyDown).keyup(documentKeyUp).mousedown(
    function(e) {
        //右键为 3
        if (3 == e.which) {
            setTimeout(() => {
                $('.wr_underline,.wr_myNote').css('display','block');
            }, 500);
        } else if (1 == e.which) {
            //左键为 1
        }
    }
)