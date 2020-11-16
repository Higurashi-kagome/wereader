/* 说明：
util.js 是从 background.js 分离出来的，这里的所有函数最初都放在 background.js 中被调用。
现在之所以单独放在这个文件中纯粹是为了缩减 background.js 的代码量，从而使结构清晰
*/

//排序
var colId = "range"
var rank = function (x, y) {
	return (x[colId] > y[colId]) ? 1 : -1
}
//报错捕捉函数
function catchErr(sender) {
	if (chrome.runtime.lastError) {
		console.log(sender + " => chrome.runtime.lastError：\n" + chrome.runtime.lastError.message)
		return true
	}else{
		return false
	}
}

//更新sync和local——处理设置页onchange不生效的问题
function updateStorageArea(configMsg={},callback=function(){}){
	//存在异步问题，故设置用于处理短时间内需要进行多次设置的情况
	const backupName = "backupName"
	if(configMsg.key && configMsg.value){
        let config = {}
        let key = configMsg.key
        let value = configMsg.value
        config[key] = value
        chrome.storage.sync.set(config,function(){
            if(catchErr("bg.updateSyncAndLocal"))alert(background_storageErrorMsg)
            chrome.storage.local.get(function(settings){
                const currentProfile = configMsg.currentProfile
                settings[background_backupKey][currentProfile][key] = (key == backupName) ? undefined : value
                chrome.storage.local.set(settings,function(){
                    if(catchErr("bg.updateSyncAndLocal"))alert(background_storageErrorMsg)
                    callback()
                })
            })
        })
    }
}

//获取当前背景页配置——用于测试
function getConfig(){
	return Config
}

//alert()——用于测试
function aler(text){
	//alert(text)
	console.log(text)
}

//存储 / 初始化设置
function settingInitialize() {
	chrome.storage.sync.get(function (setting) {
		/* 检查默认选项 */
		for(let key in Config){
			//这里必须判断是否为 undefined，因为 false 属于正常值
			if(setting[key] == undefined){
				setting[key] = Config[key]
			}
		}
		//存储到 sync
		chrome.storage.sync.set(setting,function(){
			if(catchErr("settingInitialize"))alert(background_storageErrorMsg)
		})
		/* 检查本地 storage */
		chrome.storage.local.get([background_backupKey], function(localSetting) {
			const defaultBackupName = "默认设置"
			setting.backupName = undefined
			if(localSetting[background_backupKey] == undefined){//无备份
				localSetting[background_backupKey] = {}
				localSetting[background_backupKey][defaultBackupName] = setting
			}else if(localSetting[background_backupKey][defaultBackupName] == undefined){//无默认备份
				localSetting[background_backupKey][defaultBackupName] = setting
			}
			chrome.storage.local.set(localSetting,function(){
				if(catchErr("settingInitialize"))alert(background_storageErrorMsg)
			})
		})
	})
}

//获取bid，popup.js调用
function getbookId() {
	return background_bookId
}

//发送消息到content.js
function sendMessageToContentScript(message,id) {
	if(id != undefined){
		chrome.tabs.sendMessage(id, message)
	}else{
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			if(tabs[0].id != undefined){
				chrome.tabs.sendMessage(tabs[0].id, message)
			}
		})
	}
}

//通知函数
function sendAlertMsg(msg) {
	sendMessageToContentScript({isAlertMsg: true, alertMsg: msg})
}

//复制内容
function copy(text) {
	//添加这个变量是因为发现存在一次复制成功激活多次 clipboard.on('success', function (e) {})的现象
	var count = 0;
	var inputText = document.getElementById("formatted_text");
	var copyBtn = document.getElementById("btn_copy");
	var clipboard = new ClipboardJS('.btn');
	clipboard.on('success', function (e) {
		if(count == 0){//进行检查而确保一次复制成功只调用一次sendAlertMsg()
			sendAlertMsg({icon: 'success',title: 'Copied successfully'})
			count = count + 1
		}
	});
	clipboard.on('error', function (e) {
		sendAlertMsg({title: "复制出错", text: JSON.stringify(e), confirmButtonText: '确定',icon: "error"});
	});
	inputText.innerHTML = text;
	copyBtn.click();
}

//获取数据
function getData(url, callback) {
	var httpRequest = new XMLHttpRequest();
	httpRequest.open('GET', url, true);
	httpRequest.withCredentials = true;
	try{
		httpRequest.send();
	}catch(err){
		sendAlertMsg({text: "似乎没有联网", icon: "warning"})
	}
	httpRequest.onreadystatechange = function () {
		if (httpRequest.readyState == 4 && httpRequest.status == 200) {
			var data = httpRequest.responseText;//获取到json字符串，还需解析
			callback(data);
		}else if(httpRequest.readyState == 4 && (httpRequest.status == 400 || httpRequest.status == 401 || httpRequest.status == 403 || httpRequest.status == 404 || httpRequest.status == 500)){
			sendAlertMsg({title: "获取失败:", text: JSON.stringify(httpRequest.responseText), icon: "error",confirmButtonText: '确定'})
		}
	};
}

//获取添加级别的标题
function getTitleAddedPre(title, level) {
	//添加4 5 6级是为了处理特别的书（如导入的书籍）获取数据
	var lev3 = Config["lev3"]
	var leave = 6 - (lev3.split("#").length - 1)
	var chars = new Array(leave).join("#")
	return (level == 1) ? (Config["lev1"] + title)
		: (level == 2) ? (Config["lev2"] + title)
		: (level == 3) ? (lev3 + title)
		: (level == 4) ? (("#".length <= level ? "#" : chars) + lev3 + title)
		: (level == 5) ? (("##".length <= level ? "##" : chars) + lev3 + title)
		: (level == 6) ? (("###".length <= level ? "###" : chars) + lev3 + title)
		: (("###".length <= level ? "###" : chars) + lev3 + title)
}

//转义特殊字符
function escapeText(markText){
	var exceptRegexp = /!\[[\S| ]*\]\([\S| ]*\)/g//匹配图片
	if(exceptRegexp.test(markText) == true){//不对图片进行转义
		var list = markText.split(exceptRegexp)
		var urls = markText.match(exceptRegexp)
		var count = 0
		try{
			for(var i=0,len=list.length;i<len;i++){
				if(!list[i] || (list[i] == urls[count])){
					list[i] = urls[count]
					count = count + 1
				}else{
					list[i] = escapeElem(list[i])
				}
			}
		}catch{
			return escapeElem(markText)
		}
		return list.join("")
	}else{
		return escapeElem(markText)
	}
	
	function escapeElem(text){
		var patterns1 = ["\\\\","\\*","\\{","\\}","\\[","\\]","\\(","\\)","\\+"]//因为转义英文句号会影响链接显示，故暂时不包含"\\."
		var patterns2 = ["<",">","_","`","!"]//因为#和-只会在出现在段落开头的时候才会生效，通常不用转义故暂不添加
		var patterns = patterns1.concat(patterns2)
		for(var n=0,len=patterns.length;n<len;n++){
			let pattern = patterns[n]
			let re = new RegExp(pattern,"g")
			if(re.test(text) == true){
				text = patterns1.indexOf(pattern) > -1 ? text.replace(re,pattern) : text.replace(re,"\\"+pattern)
			}
		}
		return text
	}
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

//给 markText 进行正则匹配
function getRegExpMarkText(markText,markTextEscaped,regexpCollection){
	var markTextRegexped = ""
	for(var n=0,len=regexpCollection.length;n<len;n++){
		let pattern = regexpCollection[n][1]
		let re = new RegExp(pattern)
		if(re.test(markText) == true){
			markTextRegexped = regexpCollection[n][2] + markTextEscaped + regexpCollection[n][3]
			break
		}
	}
	//如果没有正则匹配到，则返回转义后的marktext，否则返回被正则匹配后的内容
	return markTextRegexped == "" ? markTextEscaped : markTextRegexped
}

function addThoughts(chaptersAndMarks,bookId,contents,callback){
	getMyThought(bookId, function (thoughts) {
		//遍历想法
		for(var key in thoughts){
			//遍历章节将想法添加进marks
			let has = 0
			for(var i=0,len=chaptersAndMarks.length;i<len;i++){
				if(chaptersAndMarks[i].chapterUid == parseInt(key)){
					colId = "range"
					chaptersAndMarks[i].marks = chaptersAndMarks[i].marks.concat(thoughts[key]).sort(rank)
					has = 1
					break
				}
			}
			//如果标注中不包含想法所在章节
			if(!has){
				let chapter = {}
				chapter["chapterUid"] = parseInt(key)
				chapter["title"] = contents[parseInt(key)].title
				chapter["marks"] = thoughts[key]
				chaptersAndMarks.push(chapter)
			}
		}
		colId = "chapterUid"
		chaptersAndMarks.sort(rank)
		callback(chaptersAndMarks)
	})
}

//获取目录
function getContents(bookId,callback){
	var url = "https://i.weread.qq.com/book/chapterInfos?" + "bookIds=" + bookId + "&synckeys=0"
	getData(url, function (data) {
		//得到目录
		var contentData = JSON.parse(data).data[0].updated
		var contents = {}
		for (var i = 0, len = contentData.length; i < len; i++) {
			contents[contentData[i].chapterUid] = { title: contentData[i].title, level: parseInt(contentData[i].level) }
		}
		callback(contents)
	})
}

//获取章内标注
function traverseMarks(marks,setting,all){
	var res = ""
	var imgsArrIndext = 0
	for (var j = 0, len = marks.length; j < len; j++) {//遍历章内标注
		var abstract = marks[j].abstract
		var markText = abstract ? abstract : marks[j].markText
		if(!all && markText == "[插图]"){//指定为只获取本章时需要获取图片
			markText = "![" + imgsArr[imgsArrIndext][0] + "](" + imgsArr[imgsArrIndext][1] + ")"
			imgsArrIndext = imgsArrIndext + 1
			res += markText + "\n\n"
			continue
		}
		//转义特殊字符
		var markTextEscaped = setting.escape ? escapeText(markText) : markText
		//var markTextEscaped = markText
		//正则匹配，传入markTextEscaped使得匹配不受转义的影响
		markText = getRegExpMarkText(markText,markTextEscaped,setting.checkedRe)
		var style = marks[j].style
		res += addPreAndSuf(markText,style) + "\n\n"
		if(abstract){
			res += Config["thouPre"] + marks[j].content + Config["thouSuf"] + "\n\n"
		}
	}
	return res
}
//右键反馈
chrome.contextMenus.create({
    "type":"normal",
    "title":"反馈",
    "contexts":["browser_action"],
    "onclick":function() {
        chrome.tabs.create({url: "https://github.com/liuhao326/wereader/issues"})
    }
})

//监听背景页所需storage键值是否有改变
chrome.storage.onChanged.addListener(function(changes, namespace) {
	if(namespace == "sync"){
		var keys = []
		for (let key in Config) {
			keys.push(key)
		}
		chrome.storage.sync.get(keys,function(setting){
			for(let key in setting){
				if(keys.indexOf(key) > -1){
					Config[key] = setting[key]
				}
			}
		})
	}
})

//监听请求用于获取导入书籍的bookId
chrome.webRequest.onBeforeRequest.addListener(details => {
	let url = details.url
	if(url.indexOf("bookmarklist?bookId=") > -1) {
		let bookId = url.replace(/(^[\S| ]*bookId=|&type=1)/g,"")
		if(!/^\d+$/.test(bookId)){//如果bookId不为整数（说明该书为导入书籍）
			background_tempbookId = bookId
			//在内部重新注入脚本以重新获取bid
			chrome.tabs.executeScript({ file: 'inject/inject-bid.js' }, function (result) {
				catchErr("chrome.webRequest.onBeforeRequest.addListener()")
			})
		}
	}
}, {urls: ["*://weread.qq.com/web/book/*"]})

//安装事件
chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){
        chrome.tabs.create({url: "https://github.com/liuhao326/wereader/issues/4"})
    }
})