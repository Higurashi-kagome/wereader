import { Sender } from "../common/sender"
import { Message } from "./types/Message"

chrome.runtime.onConnect.addListener(function(port) {
	port.onMessage.addListener(async function(msg: Message) {
		// 消息目标
		if (msg.target !== Sender.worker) {
			return
		}
		console.log('connect onMessage: ', msg)
	})
})