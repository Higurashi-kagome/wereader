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
	//console.log("sendAlertMsg(msg)：被调用")
	sendMessageToContentScript({isAlertMsg: true, alertMsg: msg})
}

//获取bid：popup
function getbookId() {
	return document.getElementById('bookId').value;
}

//获取数据：OK
function getData(url, callback) {
	//console.log("getData(url,callback)：被调用")
	var httpRequest = new XMLHttpRequest();//第一步：建立所需的对象
	httpRequest.open('GET', url, true);//第二步：打开连接  将请求参数写在url中  ps:"./Ptest.php?name=test&nameone=testone"
	httpRequest.withCredentials = true;
	try{
		httpRequest.send();//第三步：发送请求  将请求参数写在URL中
	}catch(err){
		sendAlertMsg({title: "Oops...", text: "似乎没有联网", icon: "error",button: {text: "确定"}})
	}
	/**
	 * 获取数据后的处理程序
	 */
	httpRequest.onreadystatechange = function () {
		//console.log("getData(url,callback)：httpRequest.onreadystatechange触发")
		if (httpRequest.readyState == 4 && httpRequest.status == 200) {
			//console.log("getData(url,callback)：httpRequest.onreadystatechange获取数据结束")
			var data = httpRequest.responseText;//获取到json字符串，还需解析
			////console.log(JSON.stringify(data))
			callback(data);
		}else if(httpRequest.readyState == 4 && (httpRequest.status == 400 || httpRequest.status == 401 || httpRequest.status == 403 || httpRequest.status == 404 || httpRequest.status == 500)){
			sendAlertMsg({title: "获取失败:", text: JSON.stringify(httpRequest.responseText), icon: "error",button: {text: "确定"}})
		}
	};
}

//复制内容：OK
function copy(text) {
	//console.log("copy(text)：被调用")
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
	//console.log("getComment(url,bookId,isHtml)：被调用")
	getData(url, function (data) {
		//console.log("getComment(url,bookId,isHtml)：getData(url,callback)的回调函数被调用")
		var json = JSON.parse(data)
		var reviews = json.reviews
		var htmlContent = ""
		var content = ""
		var title = ""
		//遍历书评
		for (var i = 0, len = reviews.length; i < len; i++) {
			var bookid = reviews[i].review.bookId
			if (bookid == bookId.toString()) {
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

//获取目录：popup
function getBookContents() {
	//console.log("getBookContents()：被调用")
	injectScript({ file: 'inject/inject-getContents.js' })
}

//获取imgs：OK
function requestImgsArray() {
	//console.log("requestImgsArray()：被调用")
	//注入脚本
	injectScript({ file: 'inject/inject-copyImgs.js' })
}

//保存图片Markdown文本数组
var imgsArr = []
var imgsArrIndext = 0
//获取标注数据：OK
function getBookMarks(url, callback) {
	//console.log("getBookMarks(url,callback)：被调用")
	getData(url, function (data) {
		//console.log("getBookMarks(url,callback)：getData()的回调函数被调用")
		var json = JSON.parse(data)
		//获取章节并排序
		var chapters = json.chapters
		var colId = "chapterUid";
		//排序函数
		var rank = function (x, y) {
			return (x[colId] > y[colId]) ? 1 : -1
		}
		chapters.sort(rank);
		//获取标注
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
		////console.log(JSON.stringify(chapters))
		callback(chapters)
	});
}

//获取添加级别的标题：OK
function getTitleAddedPre(title, level) {
	//console.log("getTitleAddedPre(title,level)：被调用")
	return (level == 1) ? (document.getElementById("level1").value + title)
		: (level == 2) ? (document.getElementById("level2").value + title)
		: (level == 3) ? (document.getElementById("level3").value + title)
		: ""
}
//根据标注类型获取前后缀：OK
function getMarkPre(style) {
	return (style == 0) ? document.getElementById("style1Pre").value
		: (style == 1) ? document.getElementById("style2Pre").value
		: (style == 2) ? document.getElementById("style3Pre").value
		: ""
}
function getMarkSuf(style) {
	return (style == 0) ? document.getElementById("style1Suf").value
		: (style == 1) ? document.getElementById("style2Suf").value
		: (style == 2) ? document.getElementById("style3Suf").value
		: ""
}
/* 
function getLineUnderRegExp(lineText){
	var regExps = {"^·.*$":["- ",""]}
	for(var key in regExps){
		var r = new RegExp(regExps[key], 'g')
		var mtch = r.exec(lineText)
		if(mtch.length > 0){
			return regExps[key][0] + mtch[0] + regExps[key][1]
		}else{
			return lineText
		}
	}
}
 */
//获取标注并复制标注到剪切板：popup
function copyBookMarks(url, isAll) {
	requestImgsArray();
	//console.log("copyBookMarks(url,isAll)：被调用")
	var bookId = url.match(/bookId=[0-9]*/)[0].replace("bookId=", "")
	getData("https://i.weread.qq.com/book/chapterInfos?" + "bookIds=" + bookId + "&synckeys=0", function (chaptersData) {
		//console.log("copyBookMarks(url,isAll)：getData(url,callback)的回调函数被调用")
		getBookMarks(url, function (chaptersAndMarks) {
			//console.log("copyBookMarks(url,isAll)：getData(url,callback)的回调函数：getBookMarks(url,callback)的回调函数被调用")
			var json = JSON.parse(chaptersData)
			var contentData = json.data[0].updated
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
				}else{
					//console.log("regexpCollection：\n" + JSON.stringify(regexpCollection))
				}
				if (isAll == true) {
					//console.log("copyBookMarks(url,isAll)：isAll == true")
					for (var i = 0, len1 = chaptersAndMarks.length; i < len1; i++) {
						var chapterUid = chaptersAndMarks[i].chapterUid
						for (var j = 0, len2 = contents.length; j < len2; j++) {
							if (chapterUid == contents[j].chapterUid) {
								res += getTitleAddedPre(contents[j].title, contents[j].level) + "\n\n"
								//遍历章内标注
								for (var k = 0, len3 = chaptersAndMarks[i].marks.length; k < len3; k++) {
									var markText = chaptersAndMarks[i].marks[k].markText
									//正则匹配
									////console.log("开始正则匹配")
									////console.log(regexpCollection.length)
									for(var n=0,len4=regexpCollection.length;n<len4;n++){
										let pattern = regexpCollection[n][1]
										////console.log("pattern" + pattern)
										//let modifiers = regexpCollection[n][1]
										let re = new RegExp(pattern);
										if(re.test(markText) == true){
											markText = regexpCollection[n][2] + markText + regexpCollection[n][3]
										}
									}
									var style = chaptersAndMarks[i].marks[k].style
									res += getMarkPre(style) + markText + getMarkSuf(style) + "\n\n"
								}
							}
						}
					}
				} else {
					//遍历目录
					//console.log("copyBookMarks(url,isAll)：isAll == false")
					for (var j = 0, len2 = contents.length; j < len2; j++) {
						if (contents[j].title == document.getElementById("currentContent").value.substring(1)) {
							//console.log("copyBookMarks(url,isAll)：找到目标章节")
							res += getTitleAddedPre(contents[j].title, contents[j].level) + "\n\n"
							var chapterUid = contents[j].chapterUid
							//遍历标注
							for (var i = 0, len1 = chaptersAndMarks.length; i < len1; i++) {
								if (chaptersAndMarks[i].chapterUid == chapterUid) {
									//遍历章内标注
									if (imgsArr.length == 0) {//如果页面中有图片却没有得到图片数据，结束函数
										return
									}
									for (var k = 0, len3 = chaptersAndMarks[i].marks.length; k < len3; k++) {
										var markText = chaptersAndMarks[i].marks[k].markText
										//判断是否为对图片的标注
										if (markText == "[插图]") {
											markText = imgsArr[imgsArrIndext]
											imgsArrIndext = imgsArrIndext + 1
										}
										//正则匹配
										////console.log("开始正则匹配")
										////console.log(regexpCollection)
										for(var n=0,len4=regexpCollection.length;n<len4;n++){
											let pattern = regexpCollection[n][1]
											////console.log("pattern：" + pattern)
											//let modifiers = regexpCollection[n][1]
											let re = new RegExp(pattern);
											if(re.test(markText) == true){
												////console.log("获得匹配，MarkText：" + markText)
												markText = regexpCollection[n][2] + markText + regexpCollection[n][3]
											}
										}
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
				imgsArrIndext = 0
				copy(res)
			})
		})
	})
}

//获取热门标注：OK
function getBestBookMarks(url, callback) {
	//console.log("getBestBookMarks(url,callback)：被调用")
	getData(url, function (data) {
		//console.log("getBestBookMarks(url,callback)：getData(url,callback)：getData(url,callback)的回调函数被调用")
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
	//console.log("copyBestBookMarks(url)：被调用")
	var bookId = url.match(/bookId=[0-9]*/)[0].replace("bookId=", "")
	getData("https://i.weread.qq.com/book/chapterInfos?" + "bookIds=" + bookId + "&synckeys=0", function (data) {
		//console.log("copyBestBookMarks(url)：getData()：getData()的回调函数被调用")
		getBestBookMarks(url, function (bestMarks) {
			//console.log("copyBestBookMarks(url)：getData()：getBestBookMarks(url,callback)：getBestBookMarks(url,callback)的回调函数被调用")
			var json = JSON.parse(data)
			var contentData = json.data[0].updated
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
						if (document.getElementById("displayNumber").value == "true") {
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
	//console.log("getMyThought(url,callback)：被调用")
	getData(url, function (data) {
		//console.log("getMyThought(url,callback)：getData()：getData()的回调函数被调用")
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
	//console.log("copyThought(url)：被调用")
	var bookId = url.match(/bookId=[0-9]*/)[0].replace("bookId=", "")
	getData("https://i.weread.qq.com/book/chapterInfos?" + "bookIds=" + bookId + "&synckeys=0", function (data) {
		//console.log("copyThought(url)：getData()：getData()的回调函数被调用")
		getMyThought(url, function (thoughts) {
			//console.log("copyThought(url)：getData()：getData()的回调函数：getMyThought()：getMyThought()的回调函数被调用")
			var json = JSON.parse(data)
			var contentData = json.data[0].updated
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
							res += document.getElementById("thoughtPre").innerHTML + thoughts[key][j].content + document.getElementById("thoughtSuf").innerHTML + "\n\n"
						}
					}
				}
			}
			copy(res)
		})
	})
}

//存储 / 初始化设置：OK
function Setting() {
	//console.log("Setting()：被调用")
	chrome.storage.sync.get(null, function (setting) {
		//console.log("Setting()：获取到设置")
		//stroage中无数据时
		if (setting.s1Pre == undefined) {
			//console.log("Setting()：setting.s1Pre == undefined，开始存储初始化设置")
			chrome.storage.sync.set({
				s1Pre: document.getElementById("style1Pre").value,
				s1Suf: document.getElementById("style1Suf").value,
				s2Pre: document.getElementById("style2Pre").value,
				s2Suf: document.getElementById("style2Suf").value,
				s3Pre: document.getElementById("style3Pre").value,
				s3Suf: document.getElementById("style3Suf").value,
				lev1: document.getElementById("level1").value,
				lev2: document.getElementById("level2").value,
				lev3: document.getElementById("level3").value,
				thouPre: document.getElementById("thoughtPre").value,
				thouSuf: document.getElementById("thoughtSuf").value,
				displayN: document.getElementById("displayNumber").value
			}, function () {
				//console.log("Setting()：设置存储完毕")
			});
		} else {
			//console.log("Setting()：setting.s1Pre != undefined，准备同步设置到背景页")
			chrome.storage.sync.get(null, function (setting) {
				//console.log("Setting()：设置获取成功，开始同步设置到背景页")
				document.getElementById("style1Pre").innerHTML = setting.s1Pre;
				document.getElementById("style1Suf").innerHTML = setting.s1Suf;
				document.getElementById("style2Pre").innerHTML = setting.s2Pre;
				document.getElementById("style2Suf").innerHTML = setting.s2Suf;
				document.getElementById("style3Pre").innerHTML = setting.s3Pre;
				document.getElementById("style3Suf").innerHTML = setting.s3Suf;
				document.getElementById("level1").innerHTML = setting.lev1;
				document.getElementById("level2").innerHTML = setting.lev2;
				document.getElementById("level3").innerHTML = setting.lev3;
				document.getElementById("thoughtPre").innerHTML = setting.thouPre;
				document.getElementById("thoughtSuf").innerHTML = setting.thouSuf;
				document.getElementById("displayNumber").innerHTML = setting.displayN;
				//console.log("Setting()：同步设置完毕")
			});
		}
	});
}
Setting();

//更新设置
function updateOptions(message){
	if (message.s1Pre != undefined) {
		document.getElementById("style1Pre").innerHTML = message.s1Pre;
		chrome.storage.sync.set({ s1Pre: message.s1Pre }, function () {
			//console.log("s1Pre: message.s1Pre设置完毕")
		});
	}
	if (message.s1Suf != undefined) {
		document.getElementById("style1Suf").innerHTML = message.s1Suf;
		chrome.storage.sync.set({ s1Suf: message.s1Suf }, function () {
			//console.log("s1Suf: message.s1Suf设置完毕")
		});
	}
	if (message.s2Pre != undefined) {
		document.getElementById("style2Pre").innerHTML = message.s2Pre;
		chrome.storage.sync.set({ s2Pre: message.s2Pre }, function () {
			//console.log("s2Pre: message.s2Pre设置完毕")
		});
	}
	if (message.s2Suf != undefined) {
		document.getElementById("style2Suf").innerHTML = message.s2Suf;
		chrome.storage.sync.set({ s2Suf: message.s2Suf }, function () {
			//console.log("s2Suf: message.s2Suf设置完毕")
		});
	}
	if (message.s3Pre != undefined) {
		document.getElementById("style3Pre").innerHTML = message.s3Pre;
		chrome.storage.sync.set({ s3Pre: message.s3Pre }, function () {
			//console.log("s3Pre: message.s3Pre设置完毕")
		});
	}
	if (message.s3Suf != undefined) {
		document.getElementById("style3Suf").innerHTML = message.s3Suf;
		chrome.storage.sync.set({ s3Suf: message.s3Suf }, function () {
			//console.log("s3Suf: message.s3Suf设置完毕")
		});
	}
	if (message.lev1 != undefined) {
		document.getElementById("level1").innerHTML = message.lev1;
		chrome.storage.sync.set({ lev1: message.lev1 }, function () {
			//console.log("lev1: message.lev1设置完毕")
		});
	}
	if (message.lev2 != undefined) {
		document.getElementById("level2").innerHTML = message.lev2;
		chrome.storage.sync.set({ lev2: message.lev2 }, function () {
			//console.log("lev2: message.lev2设置完毕")
		});
	}
	if (message.lev3 != undefined) {
		document.getElementById("level3").innerHTML = message.lev3;
		chrome.storage.sync.set({ lev3: message.lev3 }, function () {
			//console.log("lev3: message.lev3设置完毕")
		});
	}
	if (message.thouPre != undefined) {
		document.getElementById("thoughtPre").innerHTML = message.thouPre;
		chrome.storage.sync.set({ thouPre: message.thouPre }, function () {
			//console.log("thouPre: message.thouPre设置完毕")
		});
	}
	if (message.thouSuf != undefined) {
		document.getElementById("thoughtSuf").innerHTML = message.thouSuf;
		chrome.storage.sync.set({ thouSuf: message.thouSuf }, function () {
			//console.log("thouSuf: message.thouSuf设置完毕")
		});
	}
	if (message.displayN != undefined) {
		chrome.storage.sync.get(["displayN"], function (setting) {
			if (setting.displayN == "true") {
				document.getElementById("displayNumber").innerHTML = "false";
				chrome.storage.sync.set({ displayN: "false" }, function () {
					//console.log("displayN: \"false\"设置完毕")
				});
			} else {
				document.getElementById("displayNumber").innerHTML = "true";
				chrome.storage.sync.set({ displayN: "true" }, function () {
					//console.log("displayN: \"true\"设置完毕")
				});
			}
		});
	}
}

//获取userVid
function getuserVid(callback) {
	//获取当前页面
	chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
		var url = ""
		try{
			url = tabs[0].url;
		}catch(err){
			//console.log(err)
		}
		chrome.cookies.get({
			url: url,
			name: 'wr_vid'
		}, function (cookie) {
			if (cookie == null) {
				callback("null")
			} else {
				callback(cookie.value.toString())
			}
		});
	});
}

//监听来自inject.js、options的消息：是不是在BookPage、是的话bid是多少；如何设置变量等
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	if (message.getBid == true) {//信息为bid
		//console.log("chrome.runtime.onMessage.addListener()：message.getBid == true，接收到bid信息")
		document.getElementById('bookId').value = message.bid;
		sendResponse('后台：我已收到你返回bid的消息：' + JSON.stringify(message));
	} else if (message.getContents == true) {//信息为来自inject-content.js的目录信息
		//console.log("chrome.runtime.onMessage.addListener()：message.getContents == true，接收到目录信息")
		var texts = message.contents;
		var res = '';
		//生成目录res
		for (var i = 0, len = texts.length; i < len; i++) {
			var level = texts[i].charAt(0);
			var chapterInfo = texts[i].substr(1);
			res += getTitleAddedPre(chapterInfo, parseInt(level)) + "\n\n";
		}
		if (document.getElementById("Bookcontents").innerHTML == "getBookContents") {//如果需要获取目录
			//console.log("chrome.runtime.onMessage.addListener()：开始设置Bookcontents");
			document.getElementById("Bookcontents").innerHTML = res;
		} else {//如果不需要获取目录，直接复制
			//console.log("chrome.runtime.onMessage.addListener()：准备复制目录");
			copy(res);
		}
		//设置当前目录
		document.getElementById("currentContent").innerHTML = message.currentContent
		sendResponse('我是后台，我已收到你返回contents的消息，消息有点长，就不详细回复了！');
	} else if (message.set == true) {//信息为options页面设置改变值
		//console.log("chrome.runtime.onMessage.addListener()：message.set == true，接收到设置页改变信息");
		updateOptions(message)
	} else if (message.picText != undefined) {//信息为图片的Markdown文本
		copy(message.picText)
	} else if (message.RimgsArr != undefined) {//信息为图片的Markdown文本数组
		//console.log("chrome.runtime.onMessage.addListener()：收到图片Markdown文本数组")
		imgsArr = message.RimgsArr
	} else if (message.injectCss != undefined) {
		//console.log("chrome.runtime.onMessage.addListener()：收到要求注入css的消息")
		var tabId
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			tabId = tabs[0].id
		})
		try{
			chrome.tabs.insertCSS(tabId, { file: message.injectCss })
		}catch(err){
			catchErr("chrome.runtime.onMessage.addListener()收到要求注入css的消息后 => chrome.tabs.insertCSS(tabId, { file: message.injectCss })出错")
		}
	} else if (message.getUserVid != undefined) {//收到content-shelf.js请求userVid的消息
		//console.log("message.getUserVid != undefined")
		//获取当前页面
		getuserVid(function(userVid){
			//console.log(userVid)
			if(userVid != undefined && userVid != "null")sendMessageToContentScript({ userVid: userVid })
		})
	}
});

//页面监测：是否在已打开页面之间切换
chrome.tabs.onActivated.addListener(function (moveInfo) {
	//console.log("chrome.tabs.onActivated.addListener()：监听到消息")
	chrome.tabs.get(moveInfo.tabId, function (tab) {
		//console.log("chrome.tabs.onActivated.addListener()：chrome.tabs.get()：获取到页面信息")
		setPopupAndBid(tab)
	});
});

//页面监控：是否发生更新
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	//console.log("chrome.tabs.onUpdated.addListener()：监听到消息")
	if (changeInfo.status == "loading") {
		//console.log("chrome.tabs.onUpdated.addListener()：changeInfo.status == \"loading\"")
		setPopupAndBid(tab)
	}

});

//根据当前tab设置popup并判断是否需要注入inject-bid.js
function setPopupAndBid(tab){
	//console.log("setPopupAndBid(tab)：被调用")
	var currentUrl = ""
	try {
		currentUrl = tab.url;
	} catch (err) {
		//console.log("setPopupAndBid(tab) => err：" + err)
	}
	//console.log("setPopupAndBid(tab)：当前页面：" + currentUrl)
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
		getBookContents();
		chrome.tabs.executeScript(tab.id, { file: 'inject/inject-bid.js' }, function (result) {
			catchErr("setPopupAndBid(tab)")
		});
		chrome.browserAction.setPopup({ popup: 'popup/popup.html' });
	}
	//console.log("setPopupAndBid(tab)：结束")
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