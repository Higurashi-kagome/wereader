import { notify } from "./worker-notification";
import { initBookIds } from "./worker-vars";

// 监听安装事件
chrome.runtime.onInstalled.addListener(function(details){
	initBookIds()
	const onUpdated = false;
	const onInstall = false;
	if(details.reason === 'install' && onInstall){
		chrome.tabs.create({url: "https://github.com/Higurashi-kagome/wereader/issues/9"});
	} else if(details.reason === 'update' && onUpdated){
		notify('')
	}
});