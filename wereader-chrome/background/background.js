/* 说明：
background.js 相当于一个函数库。函数被调用的入口则是 popup.js。
其他大部分 js 文件（包括部分 content.js）都是为实现 background.js 中函数的功能而存在的。
*/
//获取书评：popup
async function copyComment(userVid, isHtml) {
	const url = `https://i.weread.qq.com/review/list?listType=6&userVid=${userVid}&rangeType=2&mine=1&listMode=1`;
	let data = await _getData(url);
	//遍历书评
	for (const item of data.reviews) {
		if (item.review.bookId != bookId) continue;
		var {title, content, htmlContent} = item.review;
		content = content.replace("\n", "\n\n");
		break;
	}
	if (htmlContent || content || title) {//有书评
		let copyTitle='', copyContent='';
		if(title) copyTitle = `# ${title}\n\n`;
		if(isHtml) copyContent = htmlContent;
		else copyContent = content;
		copy(`${copyTitle}${copyContent}`);
	} else {
		sendAlertMsg({text: "该书无书评",icon:'warning'});
	}
}

//获取目录：pupup
async function copyContents(){
	const response = await sendMessageToContentScript({message: {isGetChapters: true}});
	let chapText = response.chapters.reduce((tempText, item)=>{
		tempText += `${getTitleAddedPre(item.title, parseInt(item.level))}\n\n`;
		return tempText;
	},'');
	copy(chapText);
}

async function getBookMarks() {
	const bookmarklist = `https://i.weread.qq.com/book/bookmarklist?bookId=${bookId}`;
	const {updated: marks} = await _getData(bookmarklist);
	if(!marks.length) return;
	/* 请求得到 chapters 方便导出不含标注的章节的标题，
	另外，某些书包含标注但标注数据中没有章节记录（一般发生在导入书籍中），此时则必须使用请求获取章节信息 */
	let chapters = await getChapters();
	/* 生成标注数据 */
	let chaptersAndMarks = chapters.map(chap=>{
		//取得章内标注并初始化 range
		let marksInAChap = 
			marks.filter(mark=>mark.chapterUid == chap.chapterUid)
			.reduce((tempMarksInAChap, curMark)=>{
				curMark.range = parseInt(curMark.range.replace(/"(\d*)-\d*"/, "$1"));
				tempMarksInAChap.push(curMark);
				return tempMarksInAChap;
		},[]);
		//排序章内标注并加入到章节内
		colId = "range";
		marksInAChap.sort(rank);
		chap.marks = marksInAChap;
		return chap;
	});
	if(Config.addThoughts) chaptersAndMarks = await addThoughts(chaptersAndMarks, chapters);
	//章节排序
	colId = "chapterUid";
	chaptersAndMarks.sort(rank);
	return chaptersAndMarks;
}

//获取标注并复制标注到剪切板：popup
async function copyBookMarks(isAll) {
	//请求需要追加到文本中的图片 Markdown 文本
	sendMessageToContentScript({message: {isGetMarkedData: true}});
	const chapsAndMarks = await getBookMarks();
	if(!chapsAndMarks) return sendAlertMsg({text: "该书无标注",icon:'warning'});
	//得到res
	var res = "";
	if (isAll) {	//获取全书标注
		res = chapsAndMarks.reduce((tempRes, curChapAndMarks)=>{
			let {title, level, marks} = curChapAndMarks;
			if(Config.allTitles||marks.length){
				tempRes += `${getTitleAddedPre(title, level)}\n\n`;
				if(curChapAndMarks.anchors){ // 存在锚点标题则默认将追加到上级上级标题末尾
					curChapAndMarks.anchors
					.forEach(anchor=>{tempRes += `${getTitleAddedPre(anchor.title, anchor.level)}\n\n`});}
			}
			if(!marks.length) return tempRes;
			tempRes += traverseMarks(marks, isAll);
			return tempRes;
		},'');
		copy(res);
	} else {	//获取本章标注
		//遍历目录
		let targetChapAndMarks = chapsAndMarks.filter(item=>{return item.isCurrent})[0];
		res += `${getTitleAddedPre(targetChapAndMarks.title, targetChapAndMarks.level)}\n\n`;
		if(targetChapAndMarks.anchors){ // 存在锚点标题则默认将追加到上级上级标题末尾
			targetChapAndMarks.anchors
			.forEach(anchor=>{res += `${getTitleAddedPre(anchor.title, anchor.level)}\n\n`});}
		//生成"[插图]"索引
		let rangeArr = targetChapAndMarks.marks.reduce((tempArr, curMark)=>{
			let content = curMark.markText||curMark.abstract;
			tempArr = tempArr.concat(getRangeArrFrom(curMark.range, content));
			return tempArr;
		},[]);
		//由 rangeArr 生成索引数组 indexArr
		let indexArr = [], generatedArr = [];
		for (let j = 0, index = -1; j < rangeArr.length; j++) {
			let targetIndex = generatedArr.indexOf(rangeArr[j]);
			if(targetIndex < 0) indexArr[j] = ++index;
			else indexArr[j] = indexArr[targetIndex];
			generatedArr.push(rangeArr[j]);
		}
		let str = traverseMarks(targetChapAndMarks.marks,isAll,indexArr);
		res += str;
		if(str) copy(res);
		else sendAlertMsg({text: "该章节无标注",icon:'warning'});
	}
}

//获取热门标注
async function getBestBookMarks() {
	const bestbookmarks = `https://i.weread.qq.com/book/bestbookmarks?bookId=${bookId}`;
	let {items: bestMarksData} = await _getData(bestbookmarks);
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

//处理数据，复制热门标注
async function copyBestBookMarks() {
	let bestMarks = await getBestBookMarks();
	//遍历 bestMark
	let res = bestMarks.reduce((tempRes, curChapAndBestMarks)=>{
		let {title, level, bestMarks} = curChapAndBestMarks;
		if(Config.allTitles||bestMarks.length){
			tempRes += `${getTitleAddedPre(title, level)}\n\n`;
			if(curChapAndBestMarks.anchors){ // 存在锚点标题则默认将追加到上级上级标题末尾
				curChapAndBestMarks.anchors
				.forEach(anchor=>{tempRes += `${getTitleAddedPre(anchor.title, anchor.level)}\n\n`});}
		}
		if(!bestMarks.length) return tempRes;
		bestMarks.forEach(bestMark=>{
			let {markText, totalCount} = bestMark;
			if(Config.displayN) totalCount = `  <u>${totalCount}</u>`;
			else totalCount = '';
			tempRes += `${markText}${totalCount}\n\n`;
		});
		return tempRes;
	},'');
	copy(res);
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
	let contents = await getChapters();
	contents = contents.reduce((tempContents, aChap)=>{
		//整理格式
		tempContents[aChap.chapterUid] = { title: aChap.title, level: aChap.level};
		return tempContents;
	},{});
	let thoughts = await getMyThought();
	let res = "";
	//thoughts——{chapterUid:[{abstract,content}]}
	for (let key in thoughts) {
		res += `${getTitleAddedPre(contents[key].title, contents[key].level)}\n\n`;
		thoughts[key].forEach(thou=>{
			res += `${Config.thouMarkPre}${thou.abstract}${Config.thouMarkSuf}\n\n`;
			res += `${Config.thouPre}${thou.content}${Config.thouSuf}\n\n`;
		});
	}
	if(!res) sendAlertMsg({text: "该书无想法",icon:'warning'});
	else copy(res);
}

function getShelfForPopup(){
	return shelfForPopup;
}

async function setShelfForPopup(shelfData, shelfHtml){
	if(shelfHtml) shelfForPopup.shelfHtml = shelfHtml;
	else shelfForPopup.shelfHtml = await getShelfHtml();
	if(shelfData) shelfForPopup.shelfData = shelfData;
	else shelfForPopup.shelfData = await getShelfData();
};

settingInitialize();
setShelfForPopup();