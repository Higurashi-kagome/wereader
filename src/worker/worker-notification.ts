/**
 * 简单消息
 * @param message 通知消息
 */
export function notify(message: string) {
	chrome.notifications.create({
		title: '微信读书笔记助手',
		iconUrl: '/icons/extension-icons/icon128.png',
		message,
		type: 'basic'
	})
}