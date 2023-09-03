import $ from 'jquery'
/**
 * 隐藏标注面板
 */
export function hideToolbar() {
    const readerToolbar = $('.reader_toolbar_container')
    if (readerToolbar.length && readerToolbar.css('display') !== 'none') readerToolbar.remove()
}

/**
 * 隐藏选中文字
 */
export function hideSelection() {
    $('.wr_selection').remove()
}
