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
		console.log(sender + " => chrome.runtime.lastError：" + chrome.runtime.lastError.message)
	}
}

//获取当前背景页配置——用于测试
function getConfig(){
	var keys = ["s1Pre","s1Suf","s2Pre","s2Suf","s3Pre","s3Suf","lev1","lev2","lev3","thouPre","thouSuf","displayN","addThoughts"]
	var items = {}
	for(var i=0,len=keys.length;i<len;i++){
		var key = keys[i]
		items[key] = document.getElementById(key).value
	}
	return items
}

//alert()——用于测试
function aler(text){
	alert(text)
}

//存储 / 初始化设置
function Setting() {
	chrome.storage.sync.get(null, function (setting) {
		//从背景页初始化设置
		var keys = ["s1Pre","s1Suf","s2Pre","s2Suf","s3Pre","s3Suf","lev1","lev2","lev3","thouPre","thouSuf"]
		for(var i=0,len=keys.length;i<len;i++){
			var key = keys[i]
			if(setting[key] == undefined){
				setting[key] = document.getElementById(key).value
			}
		}
		//同步设置到背景页
		for(var i=0,len=keys.length;i<len;i++){
			document.getElementById(keys[i]).innerHTML = setting[keys[i]]
		}
		//初始化默认选项
		keys = ["checkedRe","codePre","codeSuf","preLang","addThoughts","re"]
		for(var i=0,len=keys.length;i<len;i++){
			var key = keys[i]
			if(setting[key] == undefined){
				switch(key){
					case "checkedRe":
						setting[key] = []
						break
					case "preLang":
						setting[key] = ""
						break
					case "addThoughts":
						setting[key] = false
					case "codePre":
						setting[key] = "```"
						break
					case "codeSuf":
						setting[key] = "```"
						break
					default:
						break
				}
			}
		}
		//存储初始化设置
		chrome.storage.sync.set(setting, function () {
			//设置存储完毕
		})
	})
}

//获取bid，popup.js调用
function getbookId() {
	return document.getElementById('bookId').value;
}

//动态注入
function injectScript(detail){
	chrome.tabs.executeScript(detail, function (result) {
		catchErr("injectScript()")
	})
}

//发送消息到content.js
function sendMessageToContentScript(message) {
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		chrome.tabs.sendMessage(tabs[0].id, message);
	});
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
	return (level == 1) ? (document.getElementById("lev1").value + title)
		: (level == 2) ? (document.getElementById("lev2").value + title)
		: (level == 3) ? (document.getElementById("lev3").value + title)
		: ""
}

//转义特殊字符
function escape(markText){
	var exceptRegexp = /!\[[\S| ]*\]\([\S| ]*\)/g
	if(exceptRegexp.test(markText) == true){//文本中包含链接则不对链接中的特殊字符进行转义
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
		var patterns1 = ["\\\\","\\*","\\{","\\}","\\[","\\]","\\(","\\)","\\+","\\."]
		var patterns2 = ["<",">","_","`","#","-","!"]
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

	pre = (style == 0) ? document.getElementById("s1Pre").value
	: (style == 1) ? document.getElementById("s2Pre").value
	: (style == 2) ? document.getElementById("s3Pre").value
	: ""

	suf = (style == 0) ? document.getElementById("s1Suf").value
	: (style == 1) ? document.getElementById("s2Suf").value
	: (style == 2) ? document.getElementById("s3Suf").value
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
function traverseMarks(marks,regexpCollection,all){
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
		//markTextEscaped = escape(markText)
		var markTextEscaped = markText
		//正则匹配
		markText = getRegExpMarkText(markText,markTextEscaped,regexpCollection)
		var style = marks[j].style
		res += addPreAndSuf(markText,style) + "\n\n"
		if(abstract){
			res += document.getElementById("thouPre").innerHTML + marks[j].content + document.getElementById("thouSuf").innerHTML + "\n\n"
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
});

//监听背景页所需storage键值是否有改变
chrome.storage.onChanged.addListener(function(changes, namespace) {
	if(namespace == "sync"){
		var keys = ["s1Pre","s1Suf","s2Pre","s2Suf","s3Pre","s3Suf","lev1","lev2","lev3","thouPre","thouSuf"]
		chrome.storage.sync.get(keys,function(setting){
			for(var key in setting){
				if(keys.indexOf(key) > -1){
					value = setting[key]
					document.getElementById(key).innerHTML = (typeof value == "boolean") ? String(value) : value
				}
			}
		})
	}
});

//测试
/* var test = "#`_-{_\\刘刘浩![epub_da](https://liuhao.com)刘https://liuhao.com浩2!}[www.baidu.com]浩.+\\"
test = "每个Java程序员都很熟悉在有问题的代码中插入一些System.out.println方法调用来帮助观察程序运行的操作过程。当然，一旦发现问题的根源，就要将这些语句从代码中删去。如果接下来又出现了问题，就需要再插入几个调用System.out.println方法的语句。记录日志API就是为了解决这个问题而设计的。下面先讨论这些API的优点。#`_-{_\\刘刘浩![epub_da](https://liuhao.com)刘https://liuhao.com浩2!}[]浩.+\\"
//console.log(test)
console.log(escape(test)) */
/* var re =  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g
re = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/g
//console.log(test.split(re))
console.log(test.match(re)) */