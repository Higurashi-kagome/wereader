/* 保存鼠标位置、鼠标下的元素 */

import $ from 'jquery'

let mousePagePosition = {}
let mouseClientPosition = {}
let mouseMoveTarget: HTMLElement

// 鼠标移动事件 handler：获取鼠标位置、鼠标下的元素
function documentMouseMove(event: JQuery.MouseMoveEvent): void {
    // 保存鼠标位置
    mousePagePosition = { top: event.pageY, left: event.pageX }
    mouseClientPosition = { top: event.clientY, left: event.clientX }
    mouseMoveTarget = event.target
}

$(document).on('mousemove', documentMouseMove)

export {
    mousePagePosition,
    mouseClientPosition,
    mouseMoveTarget
}
