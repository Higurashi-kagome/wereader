/* 说明：
background.js 相当于一个函数库。函数被调用的入口则是 popup.js。
其他大部分 js 文件（包括部分 content.js）都是为实现 background.js 中函数的功能而存在的。
*/
//获取书评：popup
function getComment(userVid, isHtml) {
	const url = `https://i.weread.qq.com/review/list?listType=6&userVid=${userVid}&rangeType=2&mine=1&listMode=1`
	getData(url, function (data) {
		var htmlContent = "", content = "", title = ""
		//遍历书评
		for (const item of JSON.parse(data).reviews) {
			if (item.review.bookId == bookId.toString()) {//找到对应书
				htmlContent = item.review.htmlContent
				content = item.review.content.replace("\n", "\n\n")
				title = item.review.title
				break
			}
		}
		if (htmlContent || content || title) {//有书评
			if (isHtml) {
				title ? copy(`# ${title}\n\n${htmlContent}`) : copy(htmlContent)
			} else {
				title ? copy(`### ${title}\n\n${content}`) : copy(content)
			}
		} else {
			sendAlertMsg({text: "该书无书评",icon:'warning'})
		}
	});
}

//获取目录:pupup
function copyContents(){
	sendMessageToContentScript({message: {isGetContents: true}},(response)=>{
		let text = response.chapters.reduce((tempText, item)=>{
			tempText += `${getTitleAddedPre(item.title, parseInt(item.level))}\n\n`;
			return tempText;
		},'')
		copy(text);
	})
}

//获取标注数据-data-getBookMarks.json
function getBookMarks(contents, callback) {
	const bookmarklistUrl = `https://i.weread.qq.com/book/bookmarklist?bookId=${bookId}`
	getData(bookmarklistUrl, function (data) {
		var {updated: marks, chapters} = JSON.parse(data)
		//检查书本是否有标注
		if(marks.length == 0){
			sendAlertMsg({text: "该书无标注",icon:'warning'})
			return
		}
		//处理包含标注但没有章节记录的情况（一般发生在导入书籍中）
		if(chapters.length == 0){
			const chapterInfoUrl = `https://i.weread.qq.com/book/chapterInfos?bookIds=${bookId}&synckeys=0`
			getData(chapterInfoUrl, function (data) {
				//得到目录
				chapters = JSON.parse(data).data[0].updated
				getChaptersWithMark(chapters)
			})
		}
		getChaptersWithMark(chapters)
		//章节排序
		function getChaptersWithMark(chaptersWithMark){
			colId = "chapterUid";
			chaptersWithMark.sort(rank);
			/* 生成标注数据 */
			//遍历章节
			chaptersWithMark = chaptersWithMark.map(chapter=>{
				//遍历标注获得章内标注
				let [marksInAChapter, rangeArr] = marks.reduce((acc, curMark)=>{
					if (curMark.chapterUid.toString() != chapter.chapterUid.toString()) 
						return acc
					curMark.range = parseInt(curMark.range.replace(/"(\d*)-\d*"/, "$1"))
					acc[0].push(curMark)
					//获取"[插图]"索引
					acc[1] = acc[1].concat(getRangeArrFrom(curMark.range, curMark.markText))
					return acc
				},[[],[]])
				//排序章内标注并加入到章节内
				colId = "range"
				marksInAChapter.sort(rank)
				chapter.marks = marksInAChapter
				chapter.rangeArr = rangeArr
				return chapter
			})
			if(Config.addThoughts){
				addThoughts(chaptersWithMark,contents,function(chaptersWithMark){
					callback(chaptersWithMark)
				})
			}else{
				callback(chaptersWithMark)
			}
		}
	});
}

//获取标注并复制标注到剪切板：popup
function copyBookMarks(isAll) {
	//请求需要追加到文本中的图片 Markdown 文本
	sendMessageToContentScript({message: {isGetMarkedData:true}})
	getContents(function(contents){
		getBookMarks(contents, function (chaptersAndMarks) {
			//得到res
			var res = ""
			if (isAll) {	//获取全书标注
				let res = chaptersAndMarks.reduce((tempRes, cur)=>{
					let {title, level} = contents[cur.chapterUid]
					if(cur.marks.length > 0){//检查章内是否有标注
						tempRes += `${getTitleAddedPre(title, level)}\n\n${traverseMarks(cur.marks, isAll)}`
					}
					return tempRes
				},'')
				copy(res)
			} else {	//获取本章标注
				//遍历目录
				/* let chapterUid =  */
				for (let uid in contents) {
					if (contents[uid].isCurrent) {
						res += `${getTitleAddedPre(contents[uid].title, contents[uid].level)}\n\n`
						var chapterUid = uid
						break
					}
				}
				//遍历标注
				let str = ''
				for (const chapterAndMark of chaptersAndMarks) {
					//寻找目标章节并检查章内是否有标注
					if (chapterAndMark.chapterUid == chapterUid && chapterAndMark.marks.length) {
						//由 rangeArr 生成索引数组 indexArr
						let rangeArr = chapterAndMark.rangeArr
						rangeArr.sort(function(a, b){return a - b;})
						let indexArr = []
						for (let j = 0, index = -1; j < rangeArr.length; j++) {
							if(rangeArr[j] != rangeArr[j-1]){//与前一个range不同
								indexArr[j] = ++index
							}else{//与前一个range相同
								indexArr[j] = indexArr[j-1]
							}
						}
						str = traverseMarks(chapterAndMark.marks,isAll,indexArr)
						res += str
						break
					}
				}
				if(str) copy(res);
				else sendAlertMsg({text: "该章节无标注",icon:'warning'});
			}
			//不排除 imgArr 获取失败，故保险起见将其设置为 []
			markedData = []
		})
	})
}

//获取热门标注
function getBestBookMarks(callback) {
	const url = `https://i.weread.qq.com/book/bestbookmarks?bookId=${bookId}`
	getData(url, function (data) {
		let {chapters, items} = JSON.parse(data)
		//处理书本无热门标注的情况
		if(chapters == undefined){
			sendAlertMsg({text: "该书无热门标注",icon:'warning'})
			return
		}
		//查找每章节热门标注
		let bestMarks = chapters.reduce((tempBestMarks, cur)=>{
			let chapterUid = cur.chapterUid
			//遍历所有热门标注
			let bestMarksInAChapter = items.reduce((tempBestMarksInAChap, curItem)=>{
				if (curItem.chapterUid == chapterUid) {
					let {markText, totalCount} = curItem
					let range = parseInt(curItem.range.replace(/"(\d*)-\d*"/, "$1"))
					tempBestMarksInAChap.push({ markText: markText, totalCount: totalCount, range: range })
				}
				return tempBestMarksInAChap
			},[])
			colId = "range"
			bestMarksInAChapter.sort(rank)
			tempBestMarks[chapterUid.toString()] = bestMarksInAChapter
			return tempBestMarks
		})
		callback(bestMarks)
	})
}

//处理数据，复制热门标注
function copyBestBookMarks() {
	getContents(function(contents){
		getBestBookMarks(function (bestMarks) {
			let res = ""
			//遍历 bestMark
			for (let key in bestMarks) {
				try {
					let title = getTitleAddedPre(contents[key].title, contents[key].level)
					res += `${title}\n\n`
					bestMarks[key].forEach(item => {
						let {markText, totalCount} = item
						res += markText + (Config.displayN ? (`  <u>${totalCount}</u>`) : "") + "\n\n"
					});
				} catch (error) { /* bestMarks 中含有多余的键值，比如 bookId */ }
			}
			copy(res)
		})
	})
}

//获取想法
function getMyThought(callback) {
	const url = `https://i.weread.qq.com/review/list?bookId=${bookId}&listType=11&mine=1&synckey=0&listMode=0`
	getData(url, function (data) {
		//获取 chapterUid 并去重、排序
		let chapterUidArr = Array.from(new Set(data.match(/(?<="chapterUid":\s*)(\d*)(?=,)/g)))
		chapterUidArr.sort()
		//查找每章节标注并总结好
		let thoughts = {}
		//遍历章节
		chapterUidArr.forEach(chapterUid=>{
			let thoughtsInAChapter = []
			//遍历所有想法，将章内想法放入一个数组
			for (const item of JSON.parse(data).reviews) {
				//处理有书评的情况
				if (item.review.chapterUid == undefined || item.review.chapterUid.toString() != chapterUid) continue
				//找到指定章节的想法
				let abstract = item.review.abstract
				//替换想法前后空字符
				let content = item.review.content.replace(/(^\s*|\s*$)/g,'')
				let range = parseInt(item.review.range.replace(/"(\d*)-\d*"/, "$1"))
				//如果没有发生替换（为章末想法时发生）
				if(item.review.range.indexOf('-') < 0){
					abstract = "章末想法";
					range = item.review.createTime;
				}
				thoughtsInAChapter.push({ abstract: abstract, content: content, range: range })
			}
			colId = "range"
			thoughtsInAChapter.sort(rank)
			thoughts[chapterUid] = thoughtsInAChapter
		});
		callback(thoughts)
	});
}

//处理数据，复制想法
function copyThought() {
	getContents(function(contents){
		getMyThought(function (thoughts) {
			let res = ""
			//thoughts——{chapterUid:[{abstract,content}]}
			for (let key in thoughts) {
				res += `${getTitleAddedPre(contents[key].title, contents[key].level)}\n\n`
				thoughts[key].forEach(thou=>{
					res += `${Config.thouMarkPre}${thou.abstract}${Config.thouMarkSuf}\n\n`
					res += `${Config.thouPre}${thou.content}${Config.thouSuf}\n\n`
				})
			}
			if(!res) sendAlertMsg({text: "该书无想法",icon:'warning'})
			else copy(res)
		})
	})
}

settingInitialize()

//监听消息
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	let tabId = sender.tab.id
	switch(message.type){
		case "copyImg":
			copy(message.picText)
			break
		case "markedData":
			markedData = message.markedData
			break
		case "bookId":
			if(message.bid == "wrepub")bookId = importBookId;
			else bookId = message.bid;
			break
		case "getShelf":	//content-shelf.js 获取书架数据
			chrome.cookies.get({url: 'https://weread.qq.com/web/shelf', name: 'wr_vid'}, function (cookie) {
				if(!cookie)return
				getData(`https://i.weread.qq.com/shelf/sync?userVid=${cookie.value.toString()}&synckey=0&lectureSynckey=0`, function(data){
					sendMessageToContentScript({tabId: tabId, message: data})
				})
			})
			break
		case "injectCss":
			chrome.tabs.insertCSS(tabId,{ file: message.css },function(result){
				catchErr("chrome.tabs.insertCSS()")
			})
			break
		case "aler"://用于调试
			aler(message.message)
			break
		case "saveRegexpOptions"://保存直接关闭设置页时onchange未保存的信息
			updateStorageAreainBg(message.regexpSet)
			break
	}
})

//页面监测：是否在已打开页面之间切换
chrome.tabs.onActivated.addListener(function (moveInfo) {
	chrome.tabs.get(moveInfo.tabId, function (tab) {
		if(!catchErr("chrome.tabs.onActivated.addListener()")){
			switchTabActions(tab)
		}
	})
})

//页面监控：是否发生更新
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	if (changeInfo.status == "loading") {
		if(!catchErr("chrome.tabs.onUpdated.addListener()")){
			switchTabActions(tab)
		}
	}
})

//根据当前tab设置popup并判断是否需要注入inject-bid.js
function switchTabActions(tab){
	let currentUrl = tab.url
	let list = currentUrl.split('/')
	let isBookPage = false
	if (list.length > 5 && list[2] == "weread.qq.com" && list[3] == "web" && list[4] == "reader" && list[5] != "") {
		isBookPage = true;
	}
	if (!isBookPage) {//如果当前页面为其他页面
		chrome.browserAction.setPopup({ popup: '' })
	} else {
		//注入脚本获取 bookId
		chrome.tabs.executeScript(tab.id, { file: 'inject/inject-bid.js' }, function (result) {
			catchErr("switchTabActions(tab)：inject-bid")
		})
		//注入脚本开启 right click
		chrome.storage.sync.get(['enableRightClick'],function(result){
			catchErr("switchTabActions(tab)：inject-enableRightClick")
			if(result.enableRightClick){
				chrome.tabs.executeScript(tab.id, { file: 'inject/inject-enableRightClick.js' }, function (result) {
					catchErr("switchTabActions(tab)：inject-enableRightClick")
				})
			}
		})
		chrome.browserAction.setPopup({ popup: 'popup/popup.html' })
	}
}