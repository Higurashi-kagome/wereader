import $ from "jquery";

/* esc 按下事件 handler */
function documentEscDown(event: JQuery.KeyDownEvent) {
	let fancybox = $('.fancybox-overlay'); // fancybox
	let thoughtPanel = $('.readerWriteReviewPanel'); // 想法发布面板
	let thoughtReview = $('#readerReviewDetailPanel'); // 想法浏览面板
	let reader_toolbar = $('.reader_toolbar_container'); // 标注面板
	if (event.keyCode == 27) {
		if (fancybox.length) fancybox.remove();
		if (thoughtPanel.length && thoughtPanel.css('display') !== 'none') $('.closeButton').trigger("click");
		if (thoughtReview.length && thoughtReview.parent().css('display') !== 'none')$('body').trigger("click");
		if (reader_toolbar.length && reader_toolbar.css('display') !== 'none') reader_toolbar.remove();
	}
}

function initEscKey() {
	$(document).on({
		keydown: documentEscDown
	});
}

export {initEscKey};