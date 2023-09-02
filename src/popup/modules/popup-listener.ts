import { Message } from "../../worker/types/Message";

chrome.runtime.onMessage.addListener(function(msg: Message, sender: chrome.runtime.MessageSender, sendResponse: Function){
	// 消息目标
	if (msg.target !== 'popup') {
		return;
	}
	console.log('popup onMessage: ', msg);
	// 消息类型
	const data = msg.data
	switch (msg.type) {
		
	}
})