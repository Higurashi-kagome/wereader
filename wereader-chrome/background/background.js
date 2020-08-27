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
Setting()	// 该函数在 util.js 中
*/

/* @剩余函数
//剩余函数都用于被调用而实现某一功能
*/

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
			sendAlertMsg({text: "该书无书评",icon:'warning'})
		}
	});
}

//获取标注数据
function getBookMarks(url, callback) {
	getData(url, function (data) {
		var json = JSON.parse(data)
		//获取章节并排序
		var chapters = json.chapters
		//处理书本无标注的情况
		if(chapters.length == 0){
			sendAlertMsg({text: "该书无标注",icon:'warning'})
			return
		}
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
					copy(res)
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
											res += markText + "\n\n"
											continue
										}
										//正则匹配
										markText = getRegExpMarkText(markText,regexpCollection)
										var style = chaptersAndMarks[i].marks[k].style
										res += getMarkPre(style) + markText + getMarkSuf(style) + "\n\n"
									}
									//copy() 函数在此处调用可避免本章无标注的时候也进行复制（只复制到标题）
									copy(res)
									break
								}
								//处理该章节无标注的情况
								if(i == len1 - 1){
									sendAlertMsg({text: "该章节无标注",icon:'warning'})
								}
							}
							break
						}
					}
				}
				//不排除 imgArr 总能获取成功，故保险起见将其设置为 []
				imgsArr = []
			})
		})
	})
}

//获取热门标注
function getBestBookMarks(url, callback) {
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

//获取想法
function getMyThought(url, callback) {
	getData(url, function (data) {
		var json = JSON.parse(data)
		//处理书本无想法的请况
		if(json.reviews.length == 0){
			sendAlertMsg({text: "该书无想法",icon:'warning'})
			return
		}
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

//处理数据，复制想法
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

Setting();

//监听消息
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
		console.log(err)
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
			
		});
		chrome.browserAction.setPopup({ popup: 'popup/popup.html' });
	}
}