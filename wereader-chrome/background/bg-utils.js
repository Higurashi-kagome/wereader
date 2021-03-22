/* 说明：
util.js 是从 background.js 分离出来的，这里的所有函数最初都放在 background.js 中被调用。
现在之所以单独放在这个文件中纯粹是为了缩减 background.js 的代码量，从而使结构清晰
*/

// 排序
var colId = "range";
const rank = function (x, y) {
	return (x[colId] > y[colId]) ? 1 : -1;
}

// 报错捕捉函数
function catchErr(...sender) {
	if(!chrome.runtime.lastError)return false;
	console.log(`${sender.join('=>')}=>chrome.runtime.lastError：\n${chrome.runtime.lastError.message}`);
	return true;
}

// 更新 sync 和 local ——处理设置页 onchange 不生效的问题
function updateStorageAreainBg(configMsg={},callback=function(){}){
	//存在异步问题，故设置用于处理短时间内需要进行多次设置的情况
	if(configMsg.key === undefined) return;
	let config = {}
	let {key, value} = configMsg
	config[key] = value
	chrome.storage.sync.set(config, function(){
		if(catchErr("bg.updateSyncAndLocal"))console.error(StorageErrorMsg)
		chrome.storage.local.get(function(settings){
			const currentProfile = configMsg.currentProfile
			settings[BackupKey][currentProfile][key] = value
			chrome.storage.local.set(settings,function(){
				if(catchErr("bg.updateSyncAndLocal"))console.error(StorageErrorMsg)
				callback()
			})
		})
	})
}

async function sendMessageToContentScript(sendMsg){
	return new Promise((res, rej)=>{
		let callbackHandler = (response)=>{
			if(chrome.runtime.lastError) return rej();
			if(response) return res(response);
		}
	
		if(sendMsg.tabId != undefined){
			chrome.tabs.sendMessage(sendMsg.tabId, sendMsg.message, callbackHandler);
		}else{
			chrome.tabs.query({active: true, currentWindow: true}, (tabs)=>{
				if(!tabs[0]) return rej();
				chrome.tabs.sendMessage(tabs[0].id, sendMsg.message, callbackHandler);
			});
		}
	}).catch((error)=>{});
}

async function sendAlertMsg(msg, tabId=undefined) {
	const response = await sendMessageToContentScript({tabId: tabId, message: {isAlertMsg: true, alertMsg: msg}});
	return response;
}

// 复制内容
function copy(text) {
	//添加这个变量是因为发现存在一次复制成功激活多次 clipboard.on('success', function (e) {})的现象
	let count = 0;
	let inputText = document.getElementById("formatted_text");
	let copyBtn = document.getElementById("btn_copy");
	let clipboard = new ClipboardJS('.btn');
	clipboard.on('success', function (e) {
		if(count !== 0) return;//进行检查而确保一次复制成功只调用一次sendAlertMsg()
		sendAlertMsg({icon: 'success',title: '复制成功'});
		count = count + 1;
	});
	clipboard.on('error', function (e) {
		sendAlertMsg({title: "复制出错", text: JSON.stringify(e), confirmButtonText: '确定',icon: "error"});
	});
	inputText.innerHTML = text;
	copyBtn.click();
}

async function getJson(url){
	try {
		let response = await fetch(url, {credentials: "include", Cache: 'no-cache'});
		let data = await response.json();
		return data;
	} catch (error) {
		sendAlertMsg({title: "获取失败:", text: JSON.stringify(httpRequest), icon: "error",confirmButtonText: '确定'});
	}
}