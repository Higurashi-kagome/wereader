import $ from 'jquery'

/**
 * 绑定 tab 按钮点击事件
 */
// eslint-disable-next-line no-unused-vars
function tabClickEvent(this: HTMLElement) {
    // 隐藏 .tabContent
    $('.tabContent').css('display', 'none')
    // 去除处于 active 状态的 .tabLinks 元素
    $('.tabLinks').removeClass('active')
    // 显示当前 tab 内容
    $(`.tabContent[data-for='${$(this).attr('id')}']`).css('display', 'block')
    // 将当前 tab 按钮设置为 active
    $(this).addClass('active')
}

export { tabClickEvent }
