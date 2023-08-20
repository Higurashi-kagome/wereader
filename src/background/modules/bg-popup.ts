/* 该文件中包含提供给 popup 调用或间接调用的大部分函数 */
import { getSyncStorage } from '../../common/utils';
import { responseType } from '../../content/modules/content-getChapters';
import { Code } from '../../content/types/Code';
import { Footnote } from '../../content/types/Footnote';
import { Img } from '../../content/types/Img';
import {
    ShelfDataTypeJson,
    ShelfErrorDataType,
} from '../../types/shelfTypes';
import { ChapInfoUpdated } from '../types/ChapInfoJson';
import {
    addRangeIndexST,
    getBestBookMarks,
    getBookMarks,
    getChapters,
    getMyThought,
    getTitleAddedPreAndSuf,
    ThoughtsInAChap,
    traverseMarks,
} from './bg-popup-process';
import {
    catchErr,
    copy,
    getUserVid,
    sendAlertMsg,
    sendMessageToContentScript,
} from './bg-utils';
import {
    bookIds,
    Config,
    mpTempData,
} from './bg-vars';
import { Wereader } from './bg-wereader-api';

window.addEventListener('message', function(event){
	const message = event.data
	if (message) {
		switch (message.command) {
			// 接收来自 iframe 的渲染结果
			case 'render':
				if(message.error){
					console.error(message.error);
					sendAlertMsg({icon: 'error', title: '获取出错'});
				} else {
					copy(message.result);
				}
			break;
		}
	}
})

// 获取书本信息
export async function copyBookInfo() {
	const wereader = new Wereader(window.bookId);
	const data = await wereader.getBookInfo();
	// 发送渲染请求到 iframe
	const iframe = document.getElementById('theFrame') as HTMLIFrameElement ;
	const message = {
		command: 'render',
		context: data,
		templateStr: await getSyncStorage('metaTemplate')
	};
	iframe?.contentWindow?.postMessage(message, '*');
}

// 获取书评
export async function copyComment(userVid: string, isHtml: boolean) {
	const wereader = new Wereader(window.bookId, userVid);
	let data = await wereader.getComments();
	//遍历书评
	let title = '', content = '', htmlContent = '';
	for (const item of data.reviews) {
		if (item.review.bookId != window.bookId) continue;
		title = item.review.title;
		content = item.review.content.replace("\n", "\n\n");
		htmlContent = item.review.htmlContent;
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
export async function copyContents(){
	const response = await sendMessageToContentScript({message: {isGetChapters: true}}) as responseType;
	let chapText  = response.chapters.reduce((tempText: string, item)=>{
		tempText += `${getTitleAddedPreAndSuf(item.title, item.level)}\n\n`;
		return tempText;
	},'');
	copy(chapText);
}

// 获取标注并复制标注到剪切板
export async function copyBookMarks(isAll: boolean) {
	// 通知生成遮盖
	await sendMessageToContentScript({message: {isAddMask: true}});
	// 得到 res
	var res = "";
	if (isAll) { // 获取全书标注
		const chapsAndMarks = await getBookMarks();
		if(chapsAndMarks === undefined) return sendAlertMsg({text: "该书无标注",icon:'warning'});
		res = chapsAndMarks.reduce((tempRes, curChapAndMarks)=>{
			let {title, level, marks} = curChapAndMarks;
			if(Config.allTitles || marks.length){
				tempRes += `${getTitleAddedPreAndSuf(title, level)}\n\n`;
				// 存在锚点标题（且不与上级标题相同）则默认将追加到上级上级标题末尾
				let anchors = curChapAndMarks.anchors
				if(anchors && anchors[0].title != title){
					anchors.forEach((anchor)=>{
						tempRes += `${getTitleAddedPreAndSuf(anchor.title, anchor.level)}\n\n`
					});
				}
			}
			if(!marks.length) return tempRes;
			tempRes += traverseMarks(marks);
			return tempRes;
		},'');
		copy(res);
	} else { // 获取本章标注
		// “全书”与“本章”分别获取目录，实现页面及时遮盖
		const chapsAndMarks = await getBookMarks();
		if(chapsAndMarks === undefined) return sendAlertMsg({text: "该书无标注",icon:'warning'});
		// 遍历目录
		let targetChapAndMarks = chapsAndMarks.filter((item)=>{return item.isCurrent})[0];
		let {title, level, marks} = targetChapAndMarks;
		res += `${getTitleAddedPreAndSuf(title, level)}\n\n`;
		// 存在锚点标题（且不与上级标题相同）则默认将追加到上级上级标题末尾
		let anchors = targetChapAndMarks.anchors
		if(anchors && anchors[0].title != title){
			anchors.forEach((anchor)=>{
				res += `${getTitleAddedPreAndSuf(anchor.title, anchor.level)}\n\n`
			});
		}
		// 请求需要追加到文本中的图片 Markdown 文本，并添加索引数据到 marks
		let markedData: Array<Img|Footnote|Code> = [];
		if (Config.enableCopyImgs){
            markedData = await sendMessageToContentScript({
				message: {isGetMarkedData: true, addThoughts: Config.addThoughts}
			}) as Array<Img|Footnote|Code>;
			console.log("获取到的 markedData", markedData);
        }
        let isMatched = false; // marks 传给 addRangeIndexST 方法后是否被更新（更新说明 marks 与 markedData 匹配）
        if (markedData && markedData.length > 0) [marks, isMatched] = addRangeIndexST(marks, markedData.length);
        // 如果 marks 与 markedData 不匹配，则将 markedData 清空
        if (!isMatched) {
			console.log('标注不匹配', markedData, marks);
			markedData = [];
		}
        let str = traverseMarks(marks, markedData);
		res += str;
		if(str) copy(res);
		else sendAlertMsg({text: "该章节无标注",icon:'warning'});
	}
	// 通知移除遮盖
	await sendMessageToContentScript({message: {isRemoveMask: true}});
}

// 获取热门标注
export async function copyBestBookMarks() {
	let bestMarks = await getBestBookMarks();
	if(!bestMarks) return; // 无热门标注
	//遍历 bestMark
	let res = bestMarks.reduce((tempRes: string, curChapAndBestMarks)=>{
		let {title, level, bestMarks} = curChapAndBestMarks;
		if(Config.allTitles || bestMarks.length){
			tempRes += `${getTitleAddedPreAndSuf(title, level)}\n\n`;
			// 存在锚点标题（且不与上级标题相同）则默认将追加到上级上级标题末尾
			let anchors = curChapAndBestMarks.anchors
			if(anchors && anchors[0].title != title){
				anchors.forEach((anchor: any)=>{
					tempRes += `${getTitleAddedPreAndSuf(anchor.title, anchor.level)}\n\n`
				});
			}
		}
		if(!bestMarks.length) return tempRes;
		bestMarks.forEach((bestMark: any)=>{
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
export async function copyThought(isAll?: boolean) {
	let chaps = await getChapters();
	if (chaps === undefined) {
		alert('获取想法出错');
		return;
	}
	let contents = chaps.reduce((tempContents, aChap)=>{
		//整理格式
		tempContents.set(aChap.chapterUid, aChap);
		return tempContents;
	}, new Map<number, ChapInfoUpdated>());
	// 找到当前章节 uid
	let curChapUid = 0;
	for (const [chapUid, aChap] of contents) {
		if (aChap.isCurrent) {
			curChapUid = chapUid;
			break;
		}
	}
	let thoughts = await getMyThought();
	function getTempRes(thoughtsInAChap: ThoughtsInAChap[], chapUid: number) {
		let tempRes = `${getTitleAddedPreAndSuf(contents.get(chapUid)!.title, contents.get(chapUid)!.level)}\n\n`;
		let prevAbstract = ""; // 保存上一条想法对应标注文本
		thoughtsInAChap.forEach((thou)=>{
			// 想法
			let thouContent = `${Config.thouPre}${thou.content}${Config.thouSuf}\n\n`;
			// 想法所标注的内容
			let thouAbstract = `${Config.thouMarkPre}${thou.abstract}${Config.thouMarkSuf}\n\n`;
			// 当前标注文本和前一条标注文本内容相同、且配置去重时，不导出当前的标注
			if(thou.abstract == prevAbstract && Config.distinctThouMarks){
				thouAbstract = '';
			}
			// 是否将想法添加到对应标注之前
			if (Config.thoughtFirst){
				tempRes += (thouContent + thouAbstract);
			} else {
				tempRes += (thouAbstract + thouContent);
			}
			prevAbstract = thou.abstract
		});
		return tempRes;
	}
	let res = "";
	if (isAll) {
		thoughts.forEach((thoughtsInAChap, chapUid)=>{
			res += getTempRes(thoughtsInAChap, chapUid);
		})
	} else {
		let chapUid = curChapUid;
		let thoughtsInAChap = thoughts.get(chapUid)!;
		res += res += getTempRes(thoughtsInAChap, chapUid);
	}
	if(!res) sendAlertMsg({text: "该书无想法",icon:'warning'});
	else copy(res);
}

// 获取当前读书页的 bookId
export async function setBookId(){
	return new Promise((res, rej)=>{
		chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
			if(catchErr('setBookId')) {
				alert("bookId 获取出错，请刷新后重试。");
				return rej(false);
			}
			const tab = tabs[0];
			if(tab.url && tab.url.indexOf('//weread.qq.com/web/reader/') < 0) return;
			if(tab.id) {
				if (!bookIds.get(tab.id)) {
					alert("信息缺失，请先刷新。");
					return rej(false);
				} else {
					window.bookId = bookIds.get(tab.id);
				}
			}
			return res(true);
		})
	}).catch(err=>{});
}

// 获取书架 json 数据
export async function getShelfData(){
	const userVid = await getUserVid() as string;
	const wereader = new Wereader(window.bookId, userVid);
	const shelfData = await wereader.getShelfData();
	return shelfData;
}

// 创建微信公众号浏览页面
var sendMpMsg: {data: any, bookId: string} | undefined = undefined;
export async function createMpPage(bookId: string){
	let json = undefined;
	if(mpTempData[bookId] && mpTempData[bookId][0]){
		json = mpTempData[bookId][0];
	}else{
		let resp = await fetch(`https://i.weread.qq.com/book/articles?bookId=${bookId}&count=10&offset=0`);
		console.log('resp', resp);
		json = await resp.json();
		if(json.errmsg) return json;
		if(!mpTempData[bookId]){
			mpTempData[bookId] = [];
		}
		mpTempData[bookId][0] = json;
	}
	sendMpMsg = {data: json, bookId: bookId};
	chrome.tabs.create({url: chrome.runtime.getURL('mp.html')});
	return json;
}

// 设置供 popup 获取的书架数据
export async function setShelfData(shelfData: ShelfDataTypeJson | ShelfErrorDataType){
	if(shelfData){
		window.popupApi.shelfForPopup.shelfData = shelfData;
	}else{
		window.popupApi.shelfForPopup.shelfData = await getShelfData();
		return window.popupApi.shelfForPopup.shelfData;
	}
};

// 删除标注
export async function deleteBookmarks(isAll=false){
    const wereader = new Wereader(window.bookId);
    const chaps = await getChapters();
	if (chaps === undefined){
		return { succ: 0, fail: 'all' };
	}
	const curChap = chaps.filter((chap: any)=>{return chap.isCurrent;})[0];
    const respJson = await wereader.removeBookmarks(isAll ? undefined : curChap.chapterUid);
	return respJson;
}

export async function getReadDetail(type=1, count=3, monthTimestamp?: number){
	const wereader = new Wereader(window.bookId);
	const readDetail = await wereader.getReadDetail(type, count, monthTimestamp);
	return readDetail;
}

export { sendMpMsg };