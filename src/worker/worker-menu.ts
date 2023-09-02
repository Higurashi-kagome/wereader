import { getSyncStorage } from "../common/utils";
import { Sender } from "../common/sender";

// 右键菜单：复制
chrome.contextMenus.create({
	"id": "copy",
	"title": "复制",
	"contexts": ["all"],
	"documentUrlPatterns": ["*://weread.qq.com/web/reader/*"]
}, ()=>chrome.runtime.lastError); // https://stackoverflow.com/a/64318706

// 右键反馈
chrome.contextMenus.create({
	"id": "feedback",
	"title": "反馈",
	"contexts": ["action"]
}, ()=>chrome.runtime.lastError);

chrome.contextMenus.onClicked.addListener((info, tab) => {
	// 右键反馈
	if (info.menuItemId === "feedback") {
		chrome.tabs.create({ url: "https://github.com/Higurashi-kagome/wereader/issues/new/choose" });
	}
	// 右键复制
	if (info.menuItemId === "copy") {
		if (!tab) return;
		// 获取 DOM 元素
		chrome.tabs.sendMessage(tab.id!, "getClickedEl", { frameId: info.frameId }, data => {
			(async ()=>{
				new Sender('onReceiveDom', {data, tab, config: await getSyncStorage()}).sendToOffscreen()
			})()
			return true
		});
	}
});