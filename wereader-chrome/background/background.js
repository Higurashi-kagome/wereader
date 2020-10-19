/* 说明：
background.js 相当于一个函数库。函数被调用的入口则是 popup.js。
其他大部分 js 文件（包括部分 content.js）都是为实现 background.js 中函数的功能而存在的。
*/

/*************流程*************/

/* @监听器：

//页面是否发生更新
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	...
	setPopupAndBid(Tab)
	...
});

//是否在已打开页面之间切换
chrome.tabs.onActivated.addListener(function (moveInfo) {
	...
	setPopupAndBid(Tab)
	...
});

//监听消息
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	//根据收到的不同消息调用不同的函数或是处理数据
});
*/

/* @直接被 popup.js 调用的函数（被绑定为点击事件的函数）
//获取书评
getComment()
//获取标注
copyBookMarks()
//获取目录和开启复制按钮
injectScript()	// 该函数在 util.js 中
//获取热门标注
copyBestBookMarks()
*/

/* @其他

//在右键菜单中添加反馈选项（包含在 util.js 中）
chrome.contextMenus.create({
	...
})

//初始化设置
settingInitialize()	// 该函数在 util.js 中
*/

/* @剩余函数
//剩余函数都用于被调用而实现某一功能
*/

//获取书评：popup
function getComment(userVid, bookId, isHtml,setting) {
	var isEscape = setting.escape
	var url = "https://i.weread.qq.com/review/list?listType=6&userVid=" + userVid + "&rangeType=2&mine=1&listMode=1"
	getData(url, function (data) {
		var reviews = JSON.parse(data).reviews
		var htmlContent = ""
		var content = ""
		var title = ""
		//遍历书评
		for (var i = 0, len = reviews.length; i < len; i++) {
			var bid = reviews[i].review.bookId
			if (bid == bookId.toString()) {
				htmlContent = reviews[i].review.htmlContent
				content = reviews[i].review.content.replace("\n", "\n\n")
				title = reviews[i].review.title
				break
			}
		}
		content = isEscape ? escape(content) : content
		if (htmlContent != "" || content != "" || title != "") {
			if (isHtml) {
				(title != "") ? copy("# " + title + "\n\n" + htmlContent) : copy(htmlContent)
			} else {
				(title != "") ? copy("### " + title + "\n\n" + content) : copy(content)
			}
		} else {
			sendAlertMsg({text: "该书无书评",icon:'warning'})
		}
	});
}

//获取标注数据
function getBookMarks(bookId, add, contents, callback) {
	var url = "https://i.weread.qq.com/book/bookmarklist?bookId=" + bookId
	getData(url, function (data) {
		var json = JSON.parse(data)
		var updated = json.updated
		var chapters = json.chapters
		//检查书本是否有标注
		if(updated.length == 0){
			sendAlertMsg({text: "该书无标注",icon:'warning'})
			return
		}
		//处理包含标注但没有章节记录的情况（一般发生在导入书籍中）
		if(chapters.length == 0){
			let url = "https://i.weread.qq.com/book/chapterInfos?bookIds=" + bookId + "&synckeys=0"
			getData(url, function (data) {
				//得到目录
				var chapters = JSON.parse(data).data[0].updated
				organizingData(chapters)
			})
		}
		organizingData(chapters)
		//章节排序
		function organizingData(chapters){
			colId = "chapterUid";
			chapters.sort(rank);
			/* 生成标注数据 */
			//遍历章节
			for (var i = 0, len1 = chapters.length; i < len1; i++) {
				let chapterUid = chapters[i].chapterUid.toString()
				let marksInAChapter = []
				//遍历标注获得章内标注
				for (var j = 0, len2 = updated.length; j < len2; j++) {
					if (updated[j].chapterUid.toString() == chapterUid) {
						updated[j].range = parseInt(updated[j].range.replace("-[0-9]*?\"", "").replace("\"", ""))
						marksInAChapter.push(updated[j])
					}
				}
				//排序章内标注并加入到章节内
				colId = "range"
				marksInAChapter.sort(rank)
				chapters[i].marks = marksInAChapter
			}
			if(add){
				addThoughts(chapters,bookId,contents,function(chapters){
					callback(chapters)
				})
			}else{
				callback(chapters)
			}
		}
	});
}

//保存图片Markdown文本数组
var imgsArr = []
//获取标注并复制标注到剪切板：popup
function copyBookMarks(bookId, all, setting) {
	var add = setting.addThoughts
	//请求需要追加到文本中的图片 Markdown 文本
	injectScript({ file: 'inject/inject-copyImgs.js' })
	getContents(bookId,function(contents){
		getBookMarks(bookId, add,contents, function (chaptersAndMarks) {
			//得到res
			var res = ""
			if (all) {	//获取全书标注
				for (var i = 0, len1 = chaptersAndMarks.length; i < len1; i++) {//遍历章节
					var chapterUid = chaptersAndMarks[i].chapterUid
					var title = contents[chapterUid].title
					var level = contents[chapterUid].level
					if(chaptersAndMarks[i].marks.length > 0){//检查章内是否有标注
						res += getTitleAddedPre(title, level) + "\n\n"
						res += traverseMarks(chaptersAndMarks[i].marks,setting,all)
					}
				}
				copy(res)
			} else {	//获取本章标注
				//遍历目录
				for (var key in contents) {
					//寻找目标章节
					if (contents[key].title == document.getElementById("currentContent").value.substring(1)) {
						res += getTitleAddedPre(contents[key].title, contents[key].level) + "\n\n"
						var chapterUid = key
						break
					}
				}
				//遍历标注
				for (var i = 0, len1 = chaptersAndMarks.length; i < len1; i++) {
					//寻找目标章节
					if (chaptersAndMarks[i].chapterUid == chapterUid) {
						if(chaptersAndMarks[i].marks.length > 0){//检查章内是否有标注
							res += traverseMarks(chaptersAndMarks[i].marks,setting,all)
							copy(res)
						}
						break
					}
					//处理该章节无标注的情况
					if(i == len1 - 1) sendAlertMsg({text: "该章节无标注",icon:'warning'});
				}
			}
			//不排除 imgArr 获取失败，故保险起见将其设置为 []
			imgsArr = []
		})
	})
}

//获取热门标注
function getBestBookMarks(bookId, callback) {
	var url = "https://i.weread.qq.com/book/bestbookmarks?bookId=" + bookId
	getData(url, function (data) {
		var json = JSON.parse(data)
		var chapters = json.chapters
		//处理书本无热门标注的情况
		if(chapters == undefined){
			sendAlertMsg({text: "该书无热门标注",icon:'warning'})
			return
		}
		//查找每章节热门标注
		var bestMarks = {}
		//遍历章节
		for (var i = 0, len1 = chapters.length; i < len1; i++) {
			var chapterUid = chapters[i].chapterUid
			var bestMarksInAChapter = []
			//遍历所有热门标注
			for (var j = 0, len2 = json.items.length; j < len2; j++) {
				if (json.items[j].chapterUid == chapterUid) {
					var markText = json.items[j].markText
					var totalCount = json.items[j].totalCount
					var range = json.items[j].range.replace(/-[0-9]*?"/, "").replace("\"", "")
					bestMarksInAChapter.push({ markText: markText, totalCount: totalCount, range: parseInt(range) })
				}
			}
			colId = "range"
			bestMarksInAChapter.sort(rank)
			bestMarks[chapterUid.toString()] = bestMarksInAChapter
		}
		callback(bestMarks)
	})
}

//处理数据，复制热门标注
function copyBestBookMarks(bookId,setting) {
	var add = setting.displayN
	var isEscape = setting.escape
	getContents(bookId,function(contents){
		getBestBookMarks(bookId, function (bestMarks) {
			//得到res
			res = ""
			//遍历bestMark
			for (var key in bestMarks) {
				var title = getTitleAddedPre(contents[key].title, contents[key].level)
				res += title + "\n\n"
				//遍历章内标注
				for (var j = 0, len = bestMarks[key].length; j < len; j++) {
					markText = bestMarks[key][j].markText
					markText = isEscape ? escape(markText) : markText
					totalCount = bestMarks[key][j].totalCount
					res += markText + (add ? ("  <u>" + totalCount + "</u>") : "") + "\n\n"
				}
			}
			copy(res)
		})
	})
}

//获取想法
function getMyThought(bookId, callback) {
	var url = "https://i.weread.qq.com/review/list?bookId=" + bookId + "&listType=11&mine=1&synckey=0&listMode=0"
	getData(url, function (data) {
		var json = JSON.parse(data)
		//获取章节并排序
		var chapterList = Array.from(new Set(data.match(/"chapterUid":[0-9]*/g)))
		colId = "chapterUid"
		chapterList.sort(rank)
		//查找每章节标注并总结好
		var thoughts = {}
		//遍历章节
		for (var i = 0, len1 = chapterList.length; i < len1; i++) {
			var index = chapterList[i].indexOf(":")
			var chapterUid = chapterList[i].substring(index + 1)
			var thoughtsInAChapter = []
			//遍历所有标注
			for (var j = 0, len2 = json.reviews.length; j < len2; j++) {
				//处理有书评的情况
				if (json.reviews[j].review.chapterUid == undefined) {
					continue
				}
				if (json.reviews[j].review.chapterUid.toString() == chapterUid) {
					var abstract = json.reviews[j].review.abstract
					abstract = abstract == "[插图]" ? "{插图}" : abstract
					var content = json.reviews[j].review.content
					var range = json.reviews[j].review.range.replace(/-[0-9]*?"/, "").replace("\"", "")
					thoughtsInAChapter.push({ abstract: abstract, content: content, range: parseInt(range) })
				}
			}
			colId = "range"
			thoughtsInAChapter.sort(rank)
			thoughts[chapterUid] = thoughtsInAChapter
		}
		callback(thoughts)
	});
}

//处理数据，复制想法
function copyThought(bookId) {
	getContents(bookId,function(contents){
		getMyThought(bookId, function (thoughts) {
			//得到res
			res = ""
			//遍历thoughts——{chapterUid:[{abstract,content}]}
			for (var key in thoughts) {
				//遍历章节
				var title = getTitleAddedPre(contents[key].title, contents[key].level)
				res += title + "\n\n"
				//遍历章内想法
				for (var j = 0, len2 = thoughts[key].length; j < len2; j++) {
					res += thoughts[key][j].abstract + "\n\n"
					res += document.getElementById("thouPre").innerHTML + thoughts[key][j].content + document.getElementById("thouSuf").innerHTML + "\n\n"
				}
			}
			//处理书本无想法的请况
			if(!res){
				sendAlertMsg({text: "该书无想法",icon:'warning'})
				return
			}
			copy(res)
		})
	})
}

settingInitialize()

//监听消息
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	switch(message.type){
		case "copyImg":
			copy(message.picText)
			break
		case "imgsArr":
			imgsArr = message.RimgsArr
			break
		case "bookId":
			message.bid == "wrepub" ? document.getElementById('bookId').value = document.getElementById("tempbookId").value
			: document.getElementById('bookId').value = message.bid
			break
		case "getUserVid":	//content-shelf.js 请求获取 userVid
			chrome.cookies.get({url: 'https://weread.qq.com/web/shelf',name: 'wr_vid'}, function (cookie) {
				if(cookie != undefined && cookie != null){
					sendMessageToContentScript({ userVid: cookie.value.toString() })
				}
			})
			break
		case "injectCss":
			try{
				chrome.tabs.insertCSS({ file: message.css })
			}catch(err){
				catchErr("chrome.tabs.insertCSS()：出错")
			}
			break
		case "getContents":
			var texts = message.contents;
			var res = '';
			//生成目录res
			for (var i = 0, len = texts.length; i < len; i++) {
				var level = texts[i].charAt(0);
				var chapterInfo = texts[i].substr(1);
				res += getTitleAddedPre(chapterInfo, parseInt(level)) + "\n\n";
			}
			//如果需要获取目录，则设置，如果不需要获取目录，直接复制
			(document.getElementById("Bookcontents").innerHTML == "getBookContents") ? 
			(document.getElementById("Bookcontents").innerHTML = res) : copy(res)
			//设置当前所在目录
			document.getElementById("currentContent").innerHTML = message.currentContent
			break
	}
});

//页面监测：是否在已打开页面之间切换
chrome.tabs.onActivated.addListener(function (moveInfo) {
	chrome.tabs.get(moveInfo.tabId, function (tab) {
		try {
			setPopupAndBid(tab)
		} catch (error) {
			console.warn(error.message)
		}
	});
});

//页面监控：是否发生更新
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	if (changeInfo.status == "loading") {
		try {
			setPopupAndBid(tab)
		} catch (error) {
			console.warn(error.message)
		}
	}
});

//根据当前tab设置popup并判断是否需要注入inject-bid.js
function setPopupAndBid(tab){
	var currentUrl = tab.url
	var list = currentUrl.split('/')
	var isBookPage = false
	if (list.length > 5 && list[2] == "weread.qq.com" && list[3] == "web" && list[4] == "reader" && list[5] != "") {
		isBookPage = true;
	}
	if (!isBookPage) {//如果当前页面为其他页面
		document.getElementById('bookId').value = "null"
		chrome.browserAction.setPopup({ popup: '' })
	} else {
		//获取目录到background-page
		document.getElementById("Bookcontents").innerHTML = "getBookContents";
		//注入脚本获取全部目录数据和当前目录
		injectScript({ file: 'inject/inject-getContents.js' })
		chrome.tabs.executeScript(tab.id, { file: 'inject/inject-bid.js' }, function (result) {
			catchErr("setPopupAndBid(tab)")
		})
		chrome.browserAction.setPopup({ popup: 'popup/popup.html' })
	}
}