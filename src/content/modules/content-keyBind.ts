import { initCtrlKey } from "./content-key-ctrl";
import { initEscKey } from "./content-key-esc";

/**
 * 绑定按键监听，比如 esc 按下事件、Ctrl 按下事件
 */
function initKeyBind() {
	console.log('initKeyBind');
	initEscKey();
	initCtrlKey();
}

export {initKeyBind};