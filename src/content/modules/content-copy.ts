import { Message } from "../../worker/types/Message"
import { copy } from "./content-utils"

chrome.runtime.onMessage.addListener(function(msg: Message) {
	if (msg.target !== 'content') {
		return
	}
	console.log('content onMessage: ', msg)
	// 消息类型
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const data = msg.data as any
	switch (msg.type) {
	case 'copy':
		copy(data)
		break
	default:
		console.warn(`未知消息：'${msg.type}'`)
	}
})
