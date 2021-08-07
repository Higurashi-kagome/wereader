/* 用于处理中间过程 */

// 给标题添加前后缀
function getTitleAddedPreAndSuf(title, level) {
	let newTitle = '';
	switch (level) {
		case 1:
		case 2:
		case 3:
			newTitle = Config[`lev${level}Pre`] + title + Config[`lev${level}Suf`];
			break;
		case 4: //添加 4 5 6 级及 default 是为了处理特别的书（如导入的书籍）
		case 5:
		case 6:
		default:
			const {lev3Pre, lev3Suf} = Config;
			newTitle = `${lev3Pre}${title}${lev3Suf}`;
			break;
	}
	return newTitle;
}

// 获取标注数据
async function getBookMarks(isAddThou) {
	const wereader = new Wereader(bookId);
	const {updated: marks} = await wereader.getBookmarks();
	if(!marks.length) return;
	/* 请求得到 chapters 方便导出不含标注的章节的标题，
	另外，某些书包含标注但标注数据中没有章节记录（一般发生在导入书籍中），此时则必须使用请求获取章节信息 */
	let chapters = await getChapters();
	/* 生成标注数据 */
	let chaptersAndMarks = chapters.map(chap=>{
		//取得章内标注并初始化 range
		let marksInAChap = marks.filter(mark=>mark.chapterUid == chap.chapterUid);
		marksInAChap.map(curMark=>{
			curMark.range = parseInt(curMark.range.replace(/"(\d*)-\d*"/, "$1"));
			return curMark;
		});
		// 排序*大多数时候数据是有序的，但存在特殊情况所以必须排序*
		colId = "range";
		marksInAChap.sort(rank);
		chap.marks = marksInAChap;
		return chap;
	});
	// addThoughts 参数用于显式指明不包含想法
	if(isAddThou !== false && Config.addThoughts) chaptersAndMarks = await addThoughts(chaptersAndMarks, chapters);
	return chaptersAndMarks;
}

// 导出标注添加图片等内容
function addMarkedData(markText, indexArr, markedData,all){
	let index = 0;
	//只获取本章时"[插图]"转图片、注释或代码块
	while(!all && /\[插图\]/.test(markText)){
		let amarkedData = markedData[indexArr[index]]
		if(!amarkedData){//数组越界
			console.log('markedData', markedData);
			console.log('marks', marks);
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
	return markText;
}

// 处理章内标注
function traverseMarks(marks){
	let res = "";
	for (let j = 0; j < marks.length; j++) {//遍历章内标注
		let abstract = marks[j].abstract;
		let markText = abstract ? abstract : marks[j].markText;
		if(abstract){// 如果为想法，则为想法所标注的内容添加前后缀，同时将想法加入 res
			markText = `${Config.thouMarkPre}${markText}${Config.thouMarkSuf}`;
			res += `${Config.thouPre}${marks[j].content}${Config.thouSuf}\n\n`;
		}else{// 不是想法（为标注）则进行正则匹配
			markText = regexpReplace(markText);
		}
		res += `${addPreAndSuf(markText, marks[j].style)}\n\n`;
	}
	return res;
}

// 生成用于记录“[插图]”的数组
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

async function getChapters(){
	const wereader = new Wereader(bookId);
	const chapInfos = await wereader.getChapInfos();
	const response = await sendMessageToContentScript({message: {isGetChapters: true}});
	if(!response) return alert("获取目录出错。");
	let chapsFromServer = chapInfos.data[0].updated;
	let checkedChaps = chapsFromServer.map(chapInServer=>{
		let chapsFromDom = response.chapters;
		//某些书没有标题，或者读书页标题与数据库标题不同（往往读书页标题多出章节信息）
		if(!chapsFromDom.filter(chap=>chap.title===chapInServer.title).length){
			// 将 chapsFromDom 中的信息赋值给 chapsFromServer
			if(chapsFromDom[chapInServer.chapterIdx-1]) chapInServer.title = chapsFromDom[chapInServer.chapterIdx-1].title;
		}
		//某些书没有目录级别
		if(!chapInServer.level){
			let targetChapFromDom = chapsFromDom.filter(chapter=>chapter.title===chapInServer.title);
			if(targetChapFromDom.length) chapInServer.level = targetChapFromDom[0].level;
			else  chapInServer.level = 1;
		}else{
			chapInServer.level = parseInt(chapInServer.level);
		}
		chapInServer.isCurrent = 
			chapInServer.title === response.currentContent || response.currentContent.indexOf(chapInServer.title)>-1
		return chapInServer;
	});
	return checkedChaps;
}

// 获取热门标注数据
async function getBestBookMarks() {
	const wereader = new Wereader(bookId);
	let {items: bestMarksData} = await wereader.getBestBookmarks();
	//处理书本无热门标注的情况
	if(!bestMarksData.length){
		return sendAlertMsg({text: "该书无热门标注",icon:'warning'});
	}
	//查找每章节热门标注
	let chapters = await getChapters();
	let bestMarks = chapters.map(chap=>{
		//取得章内热门标注并初始化 range
		let bestMarksInAChap = 
			bestMarksData.filter(bestMark=>bestMark.chapterUid == chap.chapterUid)
			.reduce((tempBestMarksInAChap, curBestMark)=>{
				curBestMark.range = parseInt(curBestMark.range.replace(/"(\d*)-\d*"/, "$1"));
				tempBestMarksInAChap.push(curBestMark);
				return tempBestMarksInAChap;
		},[]);
		//排序章内标注并加入到章节内
		colId = "range";
		bestMarksInAChap.sort(rank);
		chap.bestMarks = bestMarksInAChap;
		return chap;
	});
	return bestMarks;
}

// 获取想法
async function getMyThought() {
	const wereader = new Wereader(bookId);
	let data = await wereader.getThoughts();
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

// 在标注中添加想法
async function addThoughts(chaptersAndMarks, chapters){
	chapters = chapters.reduce((tempChaps, aChap)=>{
		// 整理格式
		tempChaps[aChap.chapterUid] = { title: aChap.title, level: aChap.level};
		return tempChaps;
	},{});
	let thoughts = await getMyThought();
	//遍历章节
	for(let chapterUid in thoughts){
		//遍历章节依次将各章节章内想法添加进 marks
		let addedToMarks = false
		for(let i=0;i<chaptersAndMarks.length;i++){
			//直到找到目标章节
			if(chaptersAndMarks[i].chapterUid != chapterUid) continue;
			//想法与标注合并后按 range 排序
			colId = "range"
			let marks = chaptersAndMarks[i].marks.concat(thoughts[chapterUid]);
			marks.sort(rank);
			chaptersAndMarks[i].marks = marks;
			addedToMarks = true;
			break;
		}
		//如果想法未被成功添加进标注（想法所在章节不存在标注的情况下发生）
		if(addedToMarks) continue;
		chaptersAndMarks.push({
			chapterUid: parseInt(chapterUid),
			title: chapters[chapterUid].title,
			marks: thoughts[chapterUid]
		});
	}
	// 章节排序
	colId = "chapterUid";
	chaptersAndMarks.sort(rank);
	return chaptersAndMarks;
}

// 给 markText 进行正则替换
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

// 根据标注类型获取前后缀
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

async function getUserVid(url){
	return new Promise((res, rej) => {
		if(!url) url = 'https://weread.qq.com/';
		chrome.cookies.get({url: url, name: 'wr_vid'}, (cookie) => {
			if(catchErr('getUserVid') || !cookie) return rej(null);
			return res(cookie.value.toString());
		});
    }).catch(err=>{});
}