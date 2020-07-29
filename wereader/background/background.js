//报错捕捉函数
function catchErr(sender) {
	if (chrome.runtime.lastError != undefined && chrome.runtime.lastError != null) {
		console.warn(sender + " => chrome.runtime.lastError：" + chrome.runtime.lastError)
	}
}

//发送消息到content.js
function sendMessageToContentScript(message) {
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		chrome.tabs.sendMessage(tabs[0].id, message);
	});
}

function injectScript(detail){
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		chrome.tabs.executeScript(tabs[0].id, detail, function (result) {
			catchErr("")
		});
	})
}

//通知函数
function sendAlertMsg(msg) {
	sendMessageToContentScript({isAlertMsg: true, alertMsg: msg})
}

//获取bid：popup
function getbookId() {
	return document.getElementById('bookId').value;
}

//获取数据：OK
function getData(url, callback) {
	var httpRequest = new XMLHttpRequest();
	httpRequest.open('GET', url, true);
	httpRequest.withCredentials = true;
	try{
		httpRequest.send();
	}catch(err){
		sendAlertMsg({title: "Oops...", text: "似乎没有联网", icon: "warning",button: {text: "确定"}})
	}
	/**
	 * 获取数据后的处理程序
	 */
	httpRequest.onreadystatechange = function () {
		if (httpRequest.readyState == 4 && httpRequest.status == 200) {
			var data = httpRequest.responseText;//获取到json字符串，还需解析
			callback(data);
		}else if(httpRequest.readyState == 4 && (httpRequest.status == 400 || httpRequest.status == 401 || httpRequest.status == 403 || httpRequest.status == 404 || httpRequest.status == 500)){
			sendAlertMsg({title: "获取失败:", text: JSON.stringify(httpRequest.responseText), icon: "error",button: {text: "确定"}})
		}
	};
}

//复制内容：OK
function copy(text) {
	var inputText = document.getElementById("formatted_text");
	var copyBtn = document.getElementById("btn_copy");
	var clipboard = new Clipboard('.btn');
	clipboard.on('success', function (e) {
		sendAlertMsg({title:"复制成功！",icon: "success",button: {text: "确定"}})
	});
	clipboard.on('error', function (e) {
		console.error("复制出错:\n" + JSON.stringify(e));
		sendAlertMsg({title: "复制出错", text: JSON.stringify(e), button: {text: "确定"},icon: "error"});
	});
	inputText.innerHTML = text;
	copyBtn.click();
}

//获取书评：popup
function getComment(url, bookId, isHtml) {
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
			} else {
				continue
			}
		}
		if (htmlContent != "" || content != "" || title != "") {
			if (isHtml == true) {
				if (title != "") {
					copy("# " + title + "\n\n" + htmlContent);
				} else {
					copy(htmlContent);
				}
			} else {
				if (title != "") {
					copy("### " + title + "\n\n" + content);
				} else {
					copy(content);
				}
			}
		} else {
			sendAlertMsg({title: "该书无书评", button: {text: "确定"}})
		}
	});
}

//获取标注数据：OK
function getBookMarks(url, callback) {
	getData(url, function (data) {
		var json = JSON.parse(data)
		//获取章节并排序
		var chapters = json.chapters
		var colId = "chapterUid";
		//排序函数
		var rank = function (x, y) {
			return (x[colId] > y[colId]) ? 1 : -1
		}
		chapters.sort(rank);
		/* 生成标注数据 */
		//遍历章节
		for (var i = 0, len1 = chapters.length; i < len1; i++) {
			var chapterUid = chapters[i].chapterUid.toString()
			var updated = json.updated
			var marksInAChapter = []
			//遍历标注获得章内标注
			for (var j = 0, len2 = updated.length; j < len2; j++) {
				if (updated[j].chapterUid.toString() == chapterUid) {
					updated[j].range = parseInt(updated[j].range.replace("-[0-9]*?\"", "").replace("\"", ""))
					marksInAChapter.push(updated[j])
				}
			}
			//排序章内标注并加入到章节内
			var colId = "range"
			marksInAChapter.sort(rank)
			chapters[i].marks = marksInAChapter
		}
		callback(chapters)
	});
}

//获取添加级别的标题：OK
function getTitleAddedPre(title, level) {
	//console.log("getTitleAddedPre(title,level)：被调用")
	return (level == 1) ? (document.getElementById("lev1").value + title)
		: (level == 2) ? (document.getElementById("lev2").value + title)
		: (level == 3) ? (document.getElementById("lev3").value + title)
		: ""
}
//根据标注类型获取前后缀：OK
function getMarkPre(style) {
	return (style == 0) ? document.getElementById("s1Pre").value
		: (style == 1) ? document.getElementById("s2Pre").value
		: (style == 2) ? document.getElementById("s3Pre").value
		: ""
}
function getMarkSuf(style) {
	return (style == 0) ? document.getElementById("s1Suf").value
		: (style == 1) ? document.getElementById("s2Suf").value
		: (style == 2) ? document.getElementById("s3Suf").value
		: ""
}
//给 markText 进行正则匹配
function getRegExpMarkText(markText,regexpCollection){
	for(var n=0,len=regexpCollection.length;n<len;n++){
		let pattern = regexpCollection[n][1]
		let re = new RegExp(pattern)
		if(re.test(markText) == true){
			markText = regexpCollection[n][2] + markText + regexpCollection[n][3]
		}
	}
	return markText
}

//保存图片Markdown文本数组
var imgsArr = []
//获取标注并复制标注到剪切板：popup
function copyBookMarks(url, isAll) {
	//请求需要追加到文本中的图片 Markdown 文本
	injectScript({ file: 'inject/inject-copyImgs.js' })
	var bookId = url.match(/bookId=[0-9]*/)[0].replace("bookId=", "")
	getData("https://i.weread.qq.com/book/chapterInfos?" + "bookIds=" + bookId + "&synckeys=0", function (chaptersData) {
		getBookMarks(url, function (chaptersAndMarks) {
			var contentData = JSON.parse(chaptersData).data[0].updated
			var contents = []
			//获取contents——————[{"title":"封面","chapterUid":1,"level":1},...]
			for (var i = 0, len = contentData.length; i < len; i++) {
				contents.push({ title: contentData[i].title, chapterUid: contentData[i].chapterUid, level: parseInt(contentData[i].level) })
			}
			//得到res
			var res = ""
			chrome.storage.sync.get(["checkedRe"],function(storageData){
				var regexpCollection = storageData.checkedRe
				if(regexpCollection == undefined){
					regexpCollection = []
				}
				if (isAll == true) {
					for (var i = 0, len1 = chaptersAndMarks.length; i < len1; i++) {
						var chapterUid = chaptersAndMarks[i].chapterUid
						for (var j = 0, len2 = contents.length; j < len2; j++) {
							if (chapterUid == contents[j].chapterUid) {
								res += getTitleAddedPre(contents[j].title, contents[j].level) + "\n\n"
								//遍历章内标注
								for (var k = 0, len3 = chaptersAndMarks[i].marks.length; k < len3; k++) {
									var markText = chaptersAndMarks[i].marks[k].markText
									//正则匹配
									markText = getRegExpMarkText(markText,regexpCollection)
									var style = chaptersAndMarks[i].marks[k].style
									res += getMarkPre(style) + markText + getMarkSuf(style) + "\n\n"
								}
							}
						}
					}
				} else {
					//遍历目录
					for (var j = 0, len2 = contents.length; j < len2; j++) {
						//寻找目标章节
						if (contents[j].title == document.getElementById("currentContent").value.substring(1)) {
							res += getTitleAddedPre(contents[j].title, contents[j].level) + "\n\n"
							var chapterUid = contents[j].chapterUid
							//遍历标注
							for (var i = 0, len1 = chaptersAndMarks.length; i < len1; i++) {
								if (chaptersAndMarks[i].chapterUid == chapterUid) {
									//遍历章内标注
									if (imgsArr.length == 0) {//如果页面中有图片却没有得到图片数据，结束函数
										return
									}
									var imgsArrIndext = 0
									for (var k = 0, len3 = chaptersAndMarks[i].marks.length; k < len3; k++) {
										var markText = chaptersAndMarks[i].marks[k].markText
										//判断是否为对图片的标注
										if (markText == "[插图]") {
											markText = imgsArr[imgsArrIndext]
											imgsArrIndext = imgsArrIndext + 1
										}
										//正则匹配
										markText = getRegExpMarkText(markText,regexpCollection)
										var style = chaptersAndMarks[i].marks[k].style
										res += getMarkPre(style) + markText + getMarkSuf(style) + "\n\n"
									}
									break
								}
							}
							break
						}
					}
				}
				imgsArr = []
				copy(res)
			})
		})
	})
}

//获取热门标注：OK
function getBestBookMarks(url, callback) {
	getData(url, function (data) {
		var json = JSON.parse(data)
		var chapters = json.chapters
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
			var colId = "range"
			var rank = function (x, y) {
				return (x[colId] > y[colId]) ? 1 : -1
			}
			bestMarksInAChapter.sort(rank)
			bestMarks[chapterUid.toString()] = bestMarksInAChapter
		}
		callback(bestMarks)
	})
}

//处理数据，复制热门标注：popup
function copyBestBookMarks(url) {
	var bookId = url.match(/bookId=[0-9]*/)[0].replace("bookId=", "")
	getData("https://i.weread.qq.com/book/chapterInfos?" + "bookIds=" + bookId + "&synckeys=0", function (data) {
		getBestBookMarks(url, function (bestMarks) {
			var contentData = JSON.parse(data).data[0].updated
			var contents = []
			//获取contents——————[{"title":"封面","chapterUid":1,"level":1},...]
			for (var i = 0, len = contentData.length; i < len; i++) {
				contents.push({ title: contentData[i].title, chapterUid: contentData[i].chapterUid, level: parseInt(contentData[i].level) })
			}
			//得到res
			res = ""
			//遍历bestMark
			for (var key in bestMarks) {
				//遍历章节
				for (var i = 0, len1 = contents.length; i < len1; i++) {
					//如果找到某章热门标注对应章节
					if (key == contents[i].chapterUid) {
						var title = getTitleAddedPre(contents[i].title, contents[i].level)
						res += title + "\n\n"
						//遍历章内标注
						if (document.getElementById("displayN").value == "true") {
							for (var j = 0, len2 = bestMarks[key].length; j < len2; j++) {
								res += bestMarks[key][j].markText + "  <u>" + bestMarks[key][j].totalCount + "</u>" + "\n\n"
							}
						} else {
							for (var j = 0, len2 = bestMarks[key].length; j < len2; j++) {
								res += bestMarks[key][j].markText + "\n\n"
							}
						}
					}
				}
			}
			copy(res)
		})
	})
}

//获取想法：OK
function getMyThought(url, callback) {
	getData(url, function (data) {
		var json = JSON.parse(data)
		//获取章节并排序
		var chapterList = Array.from(new Set(data.match(/"chapterUid":[0-9]*/g)))
		var colId = "chapterUid";
		var rank = function (x, y) {
			return (x[colId] > y[colId]) ? 1 : -1
		}
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
					var content = json.reviews[j].review.content
					var range = json.reviews[j].review.range.replace(/-[0-9]*?"/, "").replace("\"", "")
					thoughtsInAChapter.push({ abstract: abstract, content: content, range: parseInt(range) })
				}
			}
			var colId = "range"
			thoughtsInAChapter.sort(rank)
			thoughts[chapterUid] = thoughtsInAChapter
		}
		callback(thoughts)
	});
}

//处理数据，复制想法：OK
function copyThought(url) {
	var bookId = url.match(/bookId=[0-9]*/)[0].replace("bookId=", "")
	getData("https://i.weread.qq.com/book/chapterInfos?" + "bookIds=" + bookId + "&synckeys=0", function (data) {
		getMyThought(url, function (thoughts) {
			var contentData = JSON.parse(data).data[0].updated
			var contents = []
			//获取contents——————[{"title":"封面","chapterUid":1,"level":1},...]
			for (var i = 0, len = contentData.length; i < len; i++) {
				contents.push({ title: contentData[i].title, chapterUid: contentData[i].chapterUid, level: parseInt(contentData[i].level) })
			}
			//得到res
			res = ""
			//遍历thoughts
			for (var key in thoughts) {
				//遍历章节
				for (var i = 0, len1 = contents.length; i < len1; i++) {
					//如果找到某章想法对应章节
					if (key == contents[i].chapterUid) {
						var title = getTitleAddedPre(contents[i].title, contents[i].level)
						res += title + "\n\n"
						//遍历章内想法
						for (var j = 0, len2 = thoughts[key].length; j < len2; j++) {
							res += thoughts[key][j].abstract + "\n\n"
							res += document.getElementById("thouPre").innerHTML + thoughts[key][j].content + document.getElementById("thouSuf").innerHTML + "\n\n"
						}
					}
				}
			}
			copy(res)
		})
	})
}

//存储 / 初始化设置
function Setting() {
	chrome.storage.sync.get(null, function (setting) {
		//stroage中无数据时
		if (setting.s1Pre == undefined) {
			var keys = ["s1Pre","s1Suf","s2Pre","s2Suf","s3Pre","s3Suf","lev1","lev2","lev3","thouPre","thouSuf","displayN"]
			var items = {}
			for(var i=0,len=keys.length;i<len;i++){
				var key = keys[i]
				items[key] = document.getElementById(key).value
			}
			//console.log("Setting()：setting.s1Pre == undefined，开始存储初始化设置")
			chrome.storage.sync.set(items, function () {
				//console.log("Setting()：设置存储完毕")
			});
		} else {
			//同步设置到背景页
			chrome.storage.sync.get(["s1Pre","s1Suf","s2Pre","s2Suf","s3Pre","s3Suf","lev1","lev2","lev3","thouPre","thouSuf","displayN"], function (setting) {
				for(var key in setting){
					document.getElementById(key).innerHTML = setting[key]
				}
			});
		}
	});
}

Setting();

//更新设置
function updateOptions(message){
	//“添加热门标注人数” 还是 前后缀
	if (message.type == "switchAddNumber") {
		chrome.storage.sync.get(["displayN"], function (setting) {
			var value = (setting.displayN == "true") ? "false" : "true"
			var key = "displayN"
			document.getElementById(key).innerHTML = value
			var items = {}
			items[key] = value
			chrome.storage.sync.set(items, function () {
				//console.log("热门标注人数选项设置完毕")
			})
		});
	} else {
		var type = message.type
		var items = {}
		items[type] = message.text
		document.getElementById(type).innerHTML = message.text;
		chrome.storage.sync.set(items, function () {
			//console.log("前后缀设置完毕")
		})
	}
}

//获取userVid
function getuserVid(callback) {
	//获取当前页面
	chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
		var url = ""
		try{
			url = tabs[0].url
		}catch(err){
			//console.log(err)
		}
		chrome.cookies.get({url: url,name: 'wr_vid'}, function (cookie) {
			cookie == null ? callback("null") : callback(cookie.value.toString())
		})
	})
}

//监听来自inject.js、options的消息：是不是在BookPage、是的话bid是多少；如何设置变量等
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	if (message.set == true) {//信息为options页面设置改变值
		updateOptions(message)
	}else{
		switch(message.type){
			case "copyImg":
				copy(message.picText)
				break
			case "imgsArr":
				imgsArr = message.RimgsArr
				break
			case "getBid":
				document.getElementById('bookId').value = message.bid;
				sendResponse('后台：我已收到你返回bid的消息：' + JSON.stringify(message));
				break
			case "getUserVid":
				getuserVid(function(userVid){
					if(userVid != undefined && userVid != "null")sendMessageToContentScript({ userVid: userVid })
				})
				break
			case "injectCss":
				chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
					var tabId = tabs[0].id
					try{
						chrome.tabs.insertCSS(tabId, { file: message.css })
					}catch(err){
						catchErr("chrome.tabs.insertCSS()：出错")
					}
				})
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
				sendResponse('我是后台，我已收到你返回contents的消息，消息有点长，就不详细回复了！');
				break
		}
	}
});

//页面监测：是否在已打开页面之间切换
chrome.tabs.onActivated.addListener(function (moveInfo) {
	chrome.tabs.get(moveInfo.tabId, function (tab) {
		setPopupAndBid(tab)
	});
});

//页面监控：是否发生更新
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	if (changeInfo.status == "loading") {
		setPopupAndBid(tab)
	}
});

//根据当前tab设置popup并判断是否需要注入inject-bid.js
function setPopupAndBid(tab){
	var currentUrl = ""
	try {
		currentUrl = tab.url;
	} catch (err) {
		//console.log("setPopupAndBid(tab) => err：" + err)
	}
	var list = currentUrl.split('/');
	var isBookPage = false;
	try {
		if (list[2] == "weread.qq.com" && list[3] == "web" && list[4] == "reader" && list[5] != "") {
			isBookPage = true;
		}
	} catch (err) {
		isBookPage = false;
	}
	if (isBookPage != true) {//如果当前页面为其他页面
		document.getElementById('bookId').value = "null";
		chrome.browserAction.setPopup({ popup: '' });
	} else {
		//获取目录到background-page
		if (document.getElementById("Bookcontents").innerHTML != "getBookContents") {
			document.getElementById("Bookcontents").innerHTML = "getBookContents";
		}
		//注入脚本获取全部目录数据和当前目录
		injectScript({ file: 'inject/inject-getContents.js' })
		chrome.tabs.executeScript(tab.id, { file: 'inject/inject-bid.js' }, function (result) {
			catchErr("setPopupAndBid(tab)")
		});
		chrome.browserAction.setPopup({ popup: 'popup/popup.html' });
	}
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