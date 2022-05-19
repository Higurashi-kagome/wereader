/* 用于接收从背景页发来的 alert 消息，并使用 sweetalert2 弹出消息通知使用者 */

import { mySweetAlert, alertMsgType } from "./content-utils";

/**
 * 监听从背景页发过来的消息，如果是 alert 消息，则调用 mySweetAlert 显示通知
 */
function initAlert() {
	console.log('initAlert');
	// 监听后台消息
	chrome.runtime.onMessage.addListener(function(msg : alertMsgType, sender, sendResponse){
		if(!msg.isAlertMsg) return;
		mySweetAlert(msg)
		// 通知后台正常显示了通知
		sendResponse({succ: 1});
	});
}

export {initAlert};