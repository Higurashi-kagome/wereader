/* Ctrl 按下事件：标注的显隐 */
import $ from "jquery";
import { mouseMoveTarget } from "./content-mousemove";

/* 在图片或代码被标注的时候不能够显示复制按钮，
所以下面的代码将会监听 Ctrl 键，Ctrl 键按下时鼠标下的标注元素将被隐藏，
此时复制按钮就能够正常使用 */
// 保存按下按键信息
var pressedKeys: {[propName: number]: boolean} = {};

// 按键（Ctrl）按下事件：隐藏底部的标注
function documentCtrlDown(event: JQuery.KeyDownEvent) {
	pressedKeys[event.keyCode] = true;
	if(pressedKeys[17]) {
		if(/wr_(myNote|underline)/.test(mouseMoveTarget.className)){
			mouseMoveTarget.style.display = 'none';
		}
	}
}

// 按键（Ctrl）抬起事件：显示标注
function documentCtrlUp(event: JQuery.KeyUpEvent) {
	pressedKeys[event.keyCode] = false;
	if(event.keyCode == 17) {
		$('.wr_underline,.wr_myNote').css('display','block');
	}
}

function initCtrlKey() {
	$(document).on({
		keydown: documentCtrlDown,
		keyup: documentCtrlUp
	});
}

export {initCtrlKey};