import { Message } from "../../worker/types/Message";

chrome.runtime.onMessage.addListener(function(msg: Message){
	// 消息目标
	if (msg.target !== 'popup') {
		return;
	}
	console.log('popup onMessage: ', msg)
})