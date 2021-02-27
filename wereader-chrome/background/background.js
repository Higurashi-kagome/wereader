/* 说明：
background.js 相当于一个函数库。函数被调用的入口则是 popup.js。
其他大部分 js 文件（包括部分 content.js）都是为实现 background.js 中函数的功能而存在的。
*/
//获取书评：popup
async function getComment(userVid, isHtml) {
	const url = `https://i.weread.qq.com/review/list?listType=6&userVid=${userVid}&rangeType=2&mine=1&listMode=1`;
	let data = await _getData(url);
	//遍历书评
	for (const item of data.reviews) {
		if (item.review.bookId !== bookId.toString()) continue;
		var {title, content, htmlContent} = item.review;
		content = content.replace("\n", "\n\n");
		break;
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

async function getBookMarks(contents) {
	const bookmarklistUrl = `https://i.weread.qq.com/book/bookmarklist?bookId=${bookId}`;
	let response = await fetch(bookmarklistUrl);
	let data = await response.json();
	var {updated: marks, chapters} = data;
	//检查书本是否有标注
	if(marks.length == 0){
		sendAlertMsg({text: "该书无标注",icon:'warning'})
		return
	}
	//处理包含标注但没有章节记录的情况（一般发生在导入书籍中）
	if(chapters.length == 0){
		const chapterInfoUrl = `https://i.weread.qq.com/book/chapterInfos?bookIds=${bookId}&synckeys=0`
		let chapResponse = await fetch(chapterInfoUrl);
		let chapData = await chapResponse.json();
		//得到目录
		chapters = chapData.data[0].updated
	}
	//章节排序
	colId = "chapterUid";
	chapters.sort(rank);
	/* 生成标注数据 */
	//遍历章节
	chapters = chapters.map(chapter=>{
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
	if(Config.addThoughts) chapters = await addThoughts(chapters,contents);
	return chapters;
}

//获取标注并复制标注到剪切板：popup
function copyBookMarks(isAll) {
	//请求需要追加到文本中的图片 Markdown 文本
	sendMessageToContentScript({message: {isGetMarkedData: true}});
	getContents(async function(contents){
		let chaptersAndMarks = await getBookMarks(contents);
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
				if (!contents[uid].isCurrent) continue;
				res += `${getTitleAddedPre(contents[uid].title, contents[uid].level)}\n\n`;
				var chapterUid = uid;
				break;
			}
			//遍历标注
			let str = ''
			for (const chapterAndMark of chaptersAndMarks) {
				//寻找目标章节并检查章内是否有标注
				if (chapterAndMark.chapterUid != chapterUid) continue;
				if (!chapterAndMark.marks.length) break;
				//由 rangeArr 生成索引数组 indexArr
				let rangeArr = chapterAndMark.rangeArr
				rangeArr.sort(function(a, b){return a - b;})
				let indexArr = []
				for (let j = 0, index = -1; j < rangeArr.length; j++) {
					if(rangeArr[j] != rangeArr[j-1]) indexArr[j] = ++index; //与前一个range不同
					else indexArr[j] = indexArr[j-1]; //与前一个range相同
				}
				str = traverseMarks(chapterAndMark.marks,isAll,indexArr)
				res += str
				break
			}
			if(str) copy(res);
			else sendAlertMsg({text: "该章节无标注",icon:'warning'});
		}
		//不排除 imgArr 获取失败，故保险起见将其设置为 []
		markedData = []
	})
}

//获取热门标注
async function getBestBookMarks() {
	const url = `https://i.weread.qq.com/book/bestbookmarks?bookId=${bookId}`;
	let data = await _getData(url);
	let {chapters, items} = data;
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
	})//TODO：是否需要初始化？
	return bestMarks;
}

//处理数据，复制热门标注
function copyBestBookMarks() {
	getContents(async function(contents){
		let bestMarks = await getBestBookMarks();
		let res = ""
		//遍历 bestMark
		for (let key in bestMarks) {
			try {
				res += `${getTitleAddedPre(contents[key].title, contents[key].level)}\n\n`
				bestMarks[key].forEach(item => {
					let {markText, totalCount} = item
					res += markText + (Config.displayN ? (`  <u>${totalCount}</u>`) : "") + "\n\n"
				});
			} catch (error) { /* bestMarks 中含有多余的键值，比如 bookId */ }
		}
		copy(res)
	})
}

//获取想法
async function getMyThought() {
	const url = `https://i.weread.qq.com/review/list?bookId=${bookId}&listType=11&mine=1&synckey=0&listMode=0`;
	let data = await _getData(url);
	//获取 chapterUid 并去重、排序
	let chapterUidArr = Array.from(new Set(JSON.stringify(data).match(/(?<="chapterUid":\s*)(\d*)(?=,)/g)))
	chapterUidArr.sort()
	//查找每章节标注并总结好
	let thoughts = {}
	//遍历章节
	chapterUidArr.forEach(chapterUid=>{
		let thoughtsInAChapter = []
		//遍历所有想法，将章内想法放入一个数组
		for (const item of data.reviews) {
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
	return thoughts;
}

//处理数据，复制想法
async function copyThought() {
	getContents(async function(contents){
		let thoughts = await getMyThought();
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
			chrome.cookies.get({url: 'https://weread.qq.com/web/shelf', name: 'wr_vid'}, async function (cookie) {
				if(!cookie) return;
				let url = 
					`https://i.weread.qq.com/shelf/sync?userVid=${cookie.value.toString()}&synckey=0&lectureSynckey=0`;
				sendMessageToContentScript({tabId: tabId, message: await _getData(url)});
			})
			break
		case "injectCss":
			chrome.tabs.insertCSS(tabId,{ file: message.css },function(result){
				catchErr("chrome.tabs.insertCSS()")
			})
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
		if(!catchErr("onUpdated.addListener()")) switchTabActions(tab)
	}
})

//根据当前tab设置popup并判断是否需要注入inject-bid.js
function switchTabActions(tab){
	let isBookPage = false;
	if (tab.url.match(/weread\.qq\.com\/web\/reader\/\S{1,}/)) isBookPage = true;
	if (!isBookPage) {//如果当前页面为其他页面
		chrome.browserAction.setPopup({ popup: '' })
	} else {
		//注入脚本获取 bookId
		chrome.tabs.executeScript(tab.id, { file: 'inject/inject-bid.js' }, function (result) {
			catchErr("switchTabActions(tab)：inject-bid")
		})
		chrome.browserAction.setPopup({ popup: 'popup/popup.html' })
	}
}