import { Renderer } from "../common/renderer";

// 接收消息
// https://developer.chrome.com/docs/extensions/mv3/sandboxingEval/
window.addEventListener('message', async function (event) {
	const message = event.data
	let result = ''
	if (message) {
		switch (message.command) {
			case 'render':
				try {
					result = new Renderer().render(message.context, message.templateStr);
				} catch (error) {
					event.source?.postMessage({ error, command: message.command }, event.origin as WindowPostMessageOptions);
					return;
				}
			break;
		}
	}
	event.source?.postMessage({ result: result, command: message.command }, event.origin as WindowPostMessageOptions);
});