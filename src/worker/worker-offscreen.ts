/**
 * 初始化 offscreen 页
 */
export function createOffset(url: string = 'offscreen.html') {
	return chrome.offscreen.createDocument({
		url,
		// @ts-ignore
		reasons: ['IFRAME_SCRIPTING','CLIPBOARD'],
		justification: 'reason for needing the document',
	})
}

createOffset().catch(()=>chrome.runtime.lastError)