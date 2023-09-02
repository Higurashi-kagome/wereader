import $ from "jquery"
/**
 * 隐藏标注面板
 */
export function hideToolbar() {
	const reader_toolbar = $('.reader_toolbar_container')
	if (reader_toolbar.length && reader_toolbar.css('display') !== 'none') reader_toolbar.remove()
}

/**
 * 隐藏选中文字
 */
export function hideSelection() {
	$('.wr_selection').remove()
}