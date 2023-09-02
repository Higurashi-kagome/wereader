import { Sender } from "../common/sender";
import { Message } from "../worker/types/Message";
import { onReceiveDom } from "./offscreen-menu-copy";
import { copy } from "./offscreen-utils";

/**
 * 初始化 offscreen 监听
 */
export function initListener() {
	chrome.runtime.onMessage.addListener(handleMessages);
	// 和 sandbox 通信
	window.addEventListener('message', function(event){
		const message = event.data
		if (message) {
			switch (message.command) {
				// 接收来自 iframe 的渲染结果
				case 'render':
					// 渲染出错
					if(message.error){
						console.error(message.error);
						new Sender().sendAlertMsg({icon: 'error', title: '获取出错'})
					} else {
						copy(message.result);
					}
				break;
			}
		}
	})
}
 
function handleMessages(msg: Message) {
	// 消息目标
	if (msg.target !== 'offscreen') {
		return;
	}
	console.log('offscreen onMessage: ', msg);
	// 消息数据
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const data = msg.data as any
	// 消息类型
	switch (msg.type) {
		case 'copy':
			copy(data)
			break;
		case 'onReceiveDom':
			onReceiveDom(data.data, data.tab, data.config)
			break;
		case 'render':
			const iframe = document.getElementById('theFrame') as HTMLIFrameElement
			iframe?.contentWindow?.postMessage(data, '*');
			break;
		default:
			console.warn(`未知消息：'${msg.type}'`);
	}
}