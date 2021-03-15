/* 该文件中包含提供给 popup 调用或间接调用的大部分函数 */

// 获取书评
async function copyComment(userVid, isHtml) {
	const url = `https://i.weread.qq.com/review/list?listType=6&userVid=${userVid}&rangeType=2&mine=1&listMode=1`;
	let data = await getJson(url);
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

// 获取目录
async function copyContents(){
	const response = await sendMessageToContentScript({message: {isGetChapters: true}});
	let chapText = response.chapters.reduce((tempText, item)=>{
		tempText += `${getTitleAddedPre(item.title, parseInt(item.level))}\n\n`;
		return tempText;
	},'');
	copy(chapText);
}

// 获取标注并复制标注到剪切板
async function copyBookMarks(isAll) {
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
		// 请求需要追加到文本中的图片 Markdown 文本
		const markedData = await sendMessageToContentScript({
			message: {isGetMarkedData: true, addThoughts: Config.addThoughts}
		});
		let str = traverseMarks(targetChapAndMarks.marks,isAll, indexArr, markedData);
		res += str;
		if(str) copy(res);
		else sendAlertMsg({text: "该章节无标注",icon:'warning'});
	}
}

// 获取热门标注
async function copyBestBookMarks() {
	let bestMarks = await getBestBookMarks();
	//遍历 bestMark
	let res = bestMarks.reduce((tempRes, curChapAndBestMarks)=>{
		let {title, level, bestMarks} = curChapAndBestMarks;
		if(Config.allTitles || bestMarks.length){
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

// 获取想法
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

// 获取当前读书页的 bookId
async function setBookId(){
	return new Promise((res, rej)=>{
		chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
			if(catchErr('setBookId')) {
				alert("bookId 获取出错，请刷新后重试。");
				return rej(false);
			}
			const tab = tabs[0];
			if(tab.url.indexOf('//weread.qq.com/web/reader/') < 0) return;
			if(!bookIds[tab.id]) {
				alert("信息缺失，请先刷新。");
				return rej(false);
			} else bookId = bookIds[tab.id];
			return res(true);
		})
	}).catch(err=>{});
}

// 获取书架 json 数据
async function getShelfData(){
	const url = 'https://weread.qq.com/web/shelf';
	const userVid = await getUserVid(url);
	const cateUrl = `${url}/sync?userVid=${userVid}&synckey=0&lectureSynckey=0`;
	const shelfData = await getJson(cateUrl);
	return shelfData;
}

// 获取书架页面 HTML
async function getShelfHtml(){
	let data = await fetch('https://weread.qq.com/web/shelf');
	let text = await data.text();
	return text;
}

// 设置供 popup 获取的书架数据
async function setShelfForPopup(shelfData, shelfHtml){
	if(shelfHtml) shelfForPopup.shelfHtml = shelfHtml;
	else shelfForPopup.shelfHtml = await getShelfHtml();
	if(shelfData) shelfForPopup.shelfData = shelfData;
	else shelfForPopup.shelfData = await getShelfData();
};

// 删除标注
async function deleteBookmarks(isAll=false){
    async function removeBookmark(bookmarkId){
        const resp = await fetch('https://weread.qq.com/web/book/removeBookmark', {
            method: 'POST',
            body: JSON.stringify({bookmarkId: bookmarkId}),
            headers: {'Content-Type': 'application/json'}
        });
        const respJson = await resp.json();
        return respJson;
    }
    const chapsAndMarks = await getBookMarks(false);
    let succ = 0, fail = 0;
	for (const chap of chapsAndMarks) {
		if(!isAll && !chap.isCurrent) continue;// 只删除当前章节而 chap 不是当前章节
		for (const mark of chap.marks) {
			let respJson = {};
			try {
				respJson = await removeBookmark(mark.bookmarkId);
			} catch (error) {
				fail++;
				continue;
			}
			if(!respJson.succ) fail++;
			else succ++;
		}
		if(!isAll) break;
	}
	return {succ:succ,fail:fail}
}

// 在背景页初次加载时自动获取 popup 所需数据
setShelfForPopup();