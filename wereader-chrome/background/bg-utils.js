/* 说明：
util.js 是从 background.js 分离出来的，这里的所有函数最初都放在 background.js 中被调用。
现在之所以单独放在这个文件中纯粹是为了缩减 background.js 的代码量，从而使结构清晰
*/

//排序
var colId = "range"
var rank = function (x, y) {
	return (x[colId] > y[colId]) ? 1 : -1
}

// 获取当前读书页的 bookId
async function setBookId(){
	return new Promise((res, rej)=>{
		chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
			if(catchErr('setBookId')) {
				alert("bookId 获取出错，请刷新后重试。");
				return rej(false);
			}
			const tab = tabs[0];
			if(tab.url.indexOf('//weread.qq.com/web/reader/') < 0) return;
			if(!bookIds[tab.id]) {
				alert("信息缺失，请先刷新。");
				return rej(false);
			} else bookId = bookIds[tab.id];
			return res(true);
		})
	}).catch(err=>{});
}

//报错捕捉函数
function catchErr(...sender) {
	if(!chrome.runtime.lastError)return false;
	console.log(`${sender.join('=>')}=>chrome.runtime.lastError：\n${chrome.runtime.lastError.message}`);
	return true;
}

function getRangeArrFrom(strRange, str){
	let lenCount = 0;
	strRange = parseInt(strRange);
	let rangeArr = str.split(/(?=\[插图\])|(?<=\[插图\])/).reduce((accArr, curItem)=>{
		if(curItem != '[插图]'){
			lenCount += curItem.length;
		}else{
			accArr.push(strRange + lenCount);
			lenCount += 4;
		}
		return accArr;
	},[]);
	return rangeArr;
}

//更新sync和local——处理设置页onchange不生效的问题
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

//存储 / 初始化设置
function settingInitialize() {
	//获取 syncSetting
	chrome.storage.sync.get(function (configInSync) {
		let unuserdKeysInSync = []
		for(let key in configInSync){
			if(Config[key] !== undefined) continue
			//如果 syncSetting 中的某个键在 Config 中不存在，则删除该键
			delete configInSync[key]
			unuserdKeysInSync.push(key)
		}
		for(let key in Config){
			//如果 Config 中的某个键在 syncSetting 中不存在（或者类型不同），则使用 Config 初始化 syncSetting
			if(configInSync[key] == undefined || configInSync[key].constructor != Config[key].constructor){
				configInSync[key] = Config[key]
			}else{//如果 Config 中的某个键在 syncSetting 中存在（并且类型相同），则使用 syncSetting 初始化 Config
				Config[key] = configInSync[key]
			}
		}
		//将 syncSetting 存储到 sync
		chrome.storage.sync.set(configInSync,function(){
			if(catchErr("settingInitialize"))console.error(StorageErrorMsg)
			//必须用 remove 来删除元素
			chrome.storage.sync.remove(unuserdKeysInSync,function(){
				if(catchErr("settingInitialize"))console.error(StorageErrorMsg)
			})
		})
		//获取 localSetting
		chrome.storage.local.get([BackupKey], function(result) {
			let configsInLocal = result[BackupKey]
			let configNameInSyncStorage = configInSync.backupName
			delete configInSync.backupName
			if(configsInLocal == undefined){//如果本地无设置
				configsInLocal = {}
				configsInLocal[DefaultBackupName] = configInSync
			}
			if(configsInLocal[DefaultBackupName] == undefined){//如果本地无默认设置
				configsInLocal[DefaultBackupName] = configInSync
			}
			//将 syncSetting 更新至 localSetting
			configsInLocal[configNameInSyncStorage] = configInSync
			//遍历 localSetting 检查格式
			let formatOfConfigInLocal = Config
			delete formatOfConfigInLocal.backupName
			for(let configName in configsInLocal){
				let localConfig = configsInLocal[configName]
				for(let keyOfLocalConfig in localConfig){//遍历单个配置
					//如果配置中的某个键在 formatOfConfigInLocal 中不存在，则删除该键
					if(formatOfConfigInLocal[keyOfLocalConfig] == undefined){
						delete configsInLocal[configName][keyOfLocalConfig]
					}
					//如果 formatOfConfigInLocal 中的某个键在配置中不存在（或者类型不同），则使用 formatOfConfigInLocal 初始化配置
					for(let keyOfFormat in formatOfConfigInLocal){
						if(localConfig[keyOfFormat]==undefined||formatOfConfigInLocal[keyOfFormat].constructor!=localConfig[keyOfFormat].constructor){
							configsInLocal[configName][keyOfFormat] = formatOfConfigInLocal[keyOfFormat]
						}
					}
				}
			}
			result[BackupKey] = configsInLocal
			chrome.storage.local.set(result,function(){
				if(catchErr("settingInitialize"))console.error(StorageErrorMsg)
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

function sendAlertMsg(msg) {
	sendMessageToContentScript({message: {isAlertMsg: true, alertMsg: msg}})
}

//复制内容
function copy(text) {
	//添加这个变量是因为发现存在一次复制成功激活多次 clipboard.on('success', function (e) {})的现象
	let count = 0;
	let inputText = document.getElementById("formatted_text");
	let copyBtn = document.getElementById("btn_copy");
	let clipboard = new ClipboardJS('.btn');
	clipboard.on('success', function (e) {
		if(count == 0){//进行检查而确保一次复制成功只调用一次sendAlertMsg()
			sendAlertMsg({icon: 'success',title: '复制成功'});
			count = count + 1;
		}
	});
	clipboard.on('error', function (e) {
		sendAlertMsg({title: "复制出错", text: JSON.stringify(e), confirmButtonText: '确定',icon: "error"});
	});
	inputText.innerHTML = text;
	copyBtn.click();
}

async function _getData(url){
	try {
		let response = await fetch(url);
		let data = await response.json();
		return data;
	} catch (error) {
		sendAlertMsg({title: "获取失败:", text: JSON.stringify(httpRequest), icon: "error",confirmButtonText: '确定'});
	}
}

//获取添加级别的标题
function getTitleAddedPre(title, level) {
	//添加 4 5 6 级是为了处理特别的书（如导入的书籍）获取数据
	let lev3 = Config["lev3"]
	let leave = 6 - (lev3.split("#").length - 1)
	let chars = new Array(leave).join("#")
	return (level == 1) ? (Config["lev1"] + title)
		: (level == 2) ? (Config["lev2"] + title)
		: (level == 3) ? (lev3 + title)
		: (level == 4) ? (("#".length <= level ? "#" : chars) + lev3 + title)
		: (level == 5) ? (("##".length <= level ? "##" : chars) + lev3 + title)
		: (level == 6) ? (("###".length <= level ? "###" : chars) + lev3 + title)
		: (("###".length <= level ? "###" : chars) + lev3 + title)
}

//根据标注类型获取前后缀
function addPreAndSuf(markText,style){

	pre = (style == 0) ? Config["s1Pre"]
	: (style == 1) ? Config["s2Pre"]
	: (style == 2) ? Config["s3Pre"]
	: ""

	suf = (style == 0) ? Config["s1Suf"]
	: (style == 1) ? Config["s2Suf"]
	: (style == 2) ? Config["s3Suf"]
	: ""
	
	return pre + markText + suf
}

//给 markText 进行正则替换
function regexpReplace(markText){
	let regexpConfig = Config.re
	for(let reId in regexpConfig){
		let replaceMsg = regexpConfig[reId].replacePattern.match(/^s\/(.+?)\/(.*?)\/(\w*)$/)
		if(!regexpConfig[reId].checked || replaceMsg == null || replaceMsg.length < 4){//检查是否选中以及是否满足格式
			continue
		}
        let pattern = replaceMsg[1]
        let replacement = replaceMsg[2]
		let flag = replaceMsg[3]
		let regexpObj = new RegExp(pattern, flag)
		if(regexpObj.test(markText)){
			markText = markText.replace(regexpObj, replacement)
			//匹配一次后结束匹配
			break
		}
	}
	return markText
}

async function addThoughts(chaptersAndMarks,contents){
	let thoughts = await getMyThought();
	//遍历章节
	for(let chapterUid in thoughts){
		//遍历章节依次将各章节章内想法添加进 marks
		let addedToMarks = false
		for(let i=0;i<chaptersAndMarks.length;i++){
			//直到找到目标章节
			if(chaptersAndMarks[i].chapterUid !== parseInt(chapterUid)) continue;
			//想法与标注合并后按 range 排序
			colId = "range"
			chaptersAndMarks[i].marks = chaptersAndMarks[i].marks.concat(thoughts[chapterUid]).sort(rank)
			addedToMarks = true
			break
		}
		//如果想法未被成功添加进标注（想法所在章节不存在标注的情况下发生）
		if(addedToMarks) continue;
		chaptersAndMarks.push({
			chapterUid: parseInt(chapterUid),
			title: contents[parseInt(chapterUid)].title,
			marks: thoughts[chapterUid]
		})
	}
	//按章节排序
	colId = "chapterUid";
	chaptersAndMarks.sort(rank);
	return chaptersAndMarks;
}

//获取目录
async function getContents(){
	const url = `https://i.weread.qq.com/book/chapterInfos?bookIds=${bookId}&synckeys=0`;
	const data = await _getData(url);
	const response = await sendMessageToContentScript({message: {isGetContents: true}});
	if(!response) return console.log("response 为空");
	let updated = data.data[0].updated;
	let contents = updated.map(aChap=>{
		let chapters = response.chapters
		//某些书没有标题，或者读书页标题与数据库标题不同（往往读书页标题多出章节信息）
		if(!chapters.filter(chapter=>chapter.title===aChap.title).length){
			if(chapters[aChap.chapterIdx-1]) aChap.title = chapters[aChap.chapterIdx-1].title
		}
		//某些书没有目录级别
		if(!aChap.level){
			let target = chapters.filter(chapter=>chapter.title===aChap.title);
			if(target.length) aChap.level = target[0].level;
			else  aChap.level = 1;
		}else{
			aChap.level = parseInt(aChap.level);
		}
		aChap.isCurrent = 
			aChap.title === response.currentContent || response.currentContent.indexOf(aChap.title)>-1
		return aChap;
	}).reduce((acc, aChap)=>{
		//整理格式
		acc[aChap.chapterUid] = { title: aChap.title, level: aChap.level, isCurrent: aChap.isCurrent};
		return acc;
	},{})
	return contents;
}

//获取章内标注
function traverseMarks(marks,all,indexArr=[]){
	let res = "", index = 0;
	for (let j = 0; j < marks.length; j++) {//遍历章内标注
		let abstract = marks[j].abstract
		let markText = abstract ? abstract : marks[j].markText
		//只获取本章时"[插图]"转图片、注释或代码块
		while(!all && /\[插图\]/.test(markText)){
			let amarkedData = markedData[indexArr[index]]
			if(!amarkedData){//数组越界
				console.error('markedData', markedData);
				console.error('markText', markText);
				return '';
			}
			let replacement = ''
			if(amarkedData.src){//图片
				//非行内图片单独占行（即使它与文字一起标注）
				let inser1 = '', inser2 = ''
				//不为行内图片且'[插图]'前有内容
				if(!amarkedData.isInlineImg && markText.indexOf('[插图]') > 0)
					inser1 = '\n\n'
				//不为行内图片且'[插图]'后有内容
				if(!amarkedData.isInlineImg && markText.indexOf('[插图]') != (markText.length - 4))
					inser2 = '\n\n'
				replacement = `${inser1}![${amarkedData.alt}](${amarkedData.src})${inser2}`
			}else if(amarkedData.footnote){//注释
				replacement = `[^${amarkedData.name}]`
			}else if(amarkedData.code){//代码块
				let inser1 = '', inser2 = ''
				//'[插图]'前有内容
				if(markText.indexOf('[插图]') > 0)
					inser1 = '\n\n'
				//'[插图]'后有内容
				if(markText.indexOf('[插图]') != (markText.length - 4))
					inser2 = '\n\n'
				replacement = `${inser1}${Config.codePre}\n${amarkedData.code}${Config.codeSuf}${inser2}`
			}
			markText = markText.replace(/\[插图\]/, replacement)
			index = index + 1
		}
		
		if(abstract){//如果为想法，则添加前后缀
			markText = `${Config.thouMarkPre}${markText}${Config.thouMarkSuf}`
		}else{//不是想法（为标注）则进行正则匹配
			markText = regexpReplace(markText)
		}
		res += `${addPreAndSuf(markText,marks[j].style)}\n\n`
		//需要添加想法时，添加想法
		if(abstract) {
			res += `${Config.thouPre}${marks[j].content}${Config.thouSuf}\n\n`
		}
	}
	if(!all){//只在获取本章时添加注脚
		markedData.forEach(element => {
			if(element.footnote) res += `[^${element.name}]:${element.footnote}\n\n`;
		});
	}
	return res;
}

//右键反馈
chrome.contextMenus.create({
    "type":"normal",
    "title":"反馈",
    "contexts":["browser_action"],
    "onclick":function() {
        chrome.tabs.create({url: "https://github.com/Higurashi-kagome/wereader/issues/new/choose"})
    }
})

//监听背景页所需 storage 键值是否有改变
chrome.storage.onChanged.addListener(function(changes, namespace) {
	console.log(`new ${namespace} changes：`)
	console.log(changes)
	// 更新 Config
	if(namespace !== 'sync') return;
	for(const key in changes){
		Config[key] = changes[key]['newValue'];
	}
})

// 监听读书页请求，由请求得到 bookId
chrome.webRequest.onBeforeRequest.addListener(details => {
	const tabId = details.tabId;
	const url = details.url;
	if(url.indexOf("bookmarklist?bookId=") < 0) return;
	const bookId = url.replace(/(^.*bookId=|&type=1)/g,"");
	bookIds[tabId] = bookId;
}, {urls: ["*://weread.qq.com/web/book/*"]});

//安装事件
chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){
        chrome.tabs.create({url: "https://github.com/Higurashi-kagome/wereader/issues/9"})
    }
	// page_action
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function(){
		chrome.declarativeContent.onPageChanged.addRules([
			{
				conditions: [
					new chrome.declarativeContent.PageStateMatcher({pageUrl: {urlContains: '://weread.qq.com/web/reader/'}})
				],
				actions: [new chrome.declarativeContent.ShowPageAction()]
			}
		]);
	});
})

