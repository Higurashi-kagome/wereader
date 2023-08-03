/* 用于处理中间过程 */
import { responseType } from '../../content/modules/content-getChapters';
import { Code } from '../../content/types/Code';
import { Footnote } from '../../content/types/Footnote';
import { Img } from '../../content/types/Img';
import { reConfigCollectionType } from '../../options/options-utils';
import { Item } from '../types/BestMarksJson';
import { ChapInfoUpdated } from '../types/ChapInfoJson';
import { Updated } from '../types/Updated';
import {
    getIndexes,
    sendAlertMsg,
    sendMessageToContentScript,
    sortByKey,
} from './bg-utils';
import {
    Config,
    ThoughtTextOptions,
} from './bg-vars';
import { Wereader } from './bg-wereader-api';

const escapeRegExp = require('lodash.escaperegexp');

export { getBookMarks, getTitleAddedPreAndSuf };

// 给标题添加前后缀
function getTitleAddedPreAndSuf(title: string, level: number) {
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
interface ChapAndMarks{
	isCurrent: unknown;
	marks: Array<Updated | ThoughtsInAChap>;
	title: string;
	level: number;
	anchors?: {
		title: string;
		level: number;
		[key: string]: any
	}[];
	bookId?: string;
	bookVersion?: number;
	chapterUid?: number;
	markText?: string;
	range?: string;
	style?: number;
	type?: number;
	createTime?: number;
	bookmarkId?: string;
}
async function getBookMarks(isAddThou?: boolean) {
	const wereader = new Wereader(window.bookId);
	const {updated: marks} = await wereader.getBookmarks();
	if(!marks.length) return;
	/* 请求得到 chapters 方便导出不含标注的章节的标题，
	另外，某些书包含标注但标注数据中没有章节记录（一般发生在导入书籍中），此时则必须使用请求获取章节信息 */
	let chapters = await getChapters() || [];
	/* 生成标注数据 */
	let chaptersAndMarks: ChapAndMarks[] = chapters.map((chap)=>{
		let chapAndMarks: ChapAndMarks = chap as unknown as ChapAndMarks;
		//取得章内标注并初始化 range
		let marksInAChap = marks.filter((mark)=>mark.chapterUid == chapAndMarks.chapterUid);
		marksInAChap = marksInAChap.map((curMark)=>{
			if(curMark.range != null && typeof curMark.range.valueOf() === "string"){
				curMark.range = curMark.range.replace(/(\d*)-\d*/, "$1");
			}
			return curMark;
		});
		// 排序*大多数时候数据是有序的，但存在特殊情况所以必须排序*
		chapAndMarks.marks = sortByKey(marksInAChap, "range") as Updated[];
		return chapAndMarks;
	});
	// addThoughts 参数用于显式指明不包含想法
	if(isAddThou !== false && Config.addThoughts) chaptersAndMarks = await addThoughts(chaptersAndMarks, chapters);
	return chaptersAndMarks;
}

// 给某一条标注添加图片等内容
// TODO：换掉 any 类型
function addMarkedData(mark: any, markedData: any, footnoteContent: string) {
	let abstract = mark.abstract;
	let markText = abstract ? abstract : mark.markText;
	for (const markedDataIdx of mark.markedDataIdxes) { // 遍历索引，逐个替换
        // 数据缺失
        if (markedData[markedDataIdx] === undefined) {
            console.log(mark, markedData);
            break;
        }
		const {imgSrc, alt, isInlineImg, footnote, footnoteName, code} = markedData[markedDataIdx];
		let replacement = '';
		/* 生成替换字符串 */
		if(imgSrc) { // 图片
			let insert1 = '', insert2 = ''; // 非行内图片单独占行（即使它与文字一起标注）
			if(!isInlineImg && markText.indexOf(Config.imgTag) > 0) // 不为行内图片且 Config.imgTag 前有内容
				insert1 = '\n\n'
			if(!isInlineImg && markText.indexOf(Config.imgTag) != (markText.length - Config.imgTag.length)) // 不为行内图片且 Config.imgTag 后有内容
				insert2 = '\n\n'
			replacement = `${insert1}![${alt}](${imgSrc})${insert2}`
		}else if (footnote) { //注释
			const footnoteId = footnoteName.replace(/[\s<>"]/, '-');
			const footnoteNum = footnoteName.match(/(?<=注)(\d)*$/)[0];
			replacement = `<sup><a id="${footnoteId}-ref" href="#${footnoteId}">${footnoteNum}</a></sup>`;
			footnoteContent += `<p id="${footnoteId}">${footnoteNum}. ${footnote}<a href="#${footnoteId}-ref">&#8617;</a></p>\n`;
		}else if (code) { //代码块
			let insert1 = '', insert2 = ''
			if(markText.indexOf(Config.imgTag) > 0) //Config.imgTag 前有内容
				insert1 = '\n\n'
			if(markText.indexOf(Config.imgTag) != (markText.length - Config.imgTag.length)) //Config.imgTag 后有内容
				insert2 = '\n\n'
			replacement = `${insert1}${Config.codePre}\n${code}\n${Config.codeSuf}${insert2}`
		}
		if (replacement) { // 替换
			markText = markText.replace(Config.imgTag, replacement);
			if (abstract) mark.abstract = markText; // 新字符串赋值回 mark
			else mark.markText = markText;
		} else console.log(mark, markedData);
	}
	// footnoteContent 不断更新，最后在 traverseMarks 中追加到文字末尾
	return [mark, footnoteContent];
}

// 在 marks 中添加替换数据索引（每一个 Config.imgTag 用哪个位置的 markedData 替换）
export function addRangeIndexST(marks: any, markedDataLength: number) {
    // Config.imgTag 的 range 作为键，该 Config.imgTag 所对应的数据在 markedData 中的索引作为值
	let used: {[key: string]: number} = {};
    // markedData 索引
	let markedDataIdx = 0;
    // 不重复的 Config.imgTag 的个数，正常情况下，应该与 markedData 的长度相等
    let targetCnt = 0;
	for (let i = 0; i < marks.length; i++) {
		let {abstract, range: markRange} = marks[i];
		let markText = abstract ? abstract : marks[i].markText;
        // 获取当前标注中的 Config.imgTag 位置
		let indexes = getIndexes(markText, Config.imgTag);
		let markedDataIdxes = [];
        // 遍历当前标注中的 Config.imgTag 位置
		for (const idx of indexes) {
            // 计算某个 Config.imgTag 在本章标注中的唯一位置
			let imgRange = markRange + idx;
			if (used[imgRange] === undefined) { // 该 Config.imgTag 没有记录过
                targetCnt++;
				used[imgRange] = markedDataIdx; // 记录某个位置的 Config.imgTag 所对应的替换数据
				markedDataIdxes.push(markedDataIdx++);
			} else { // Config.imgTag 被记录过（同一个 Config.imgTag 多次出现）
				markedDataIdxes.push(used[imgRange]);
			}
		}
		marks[i].markedDataIdxes = markedDataIdxes;
	}
    // 返回 boolean 值表示 marks 与 markedData 数据匹配
    if (markedDataLength === targetCnt) return [marks, true];
	else return [marks, false];
}

// 处理章内标注
export function traverseMarks(marks: (Updated | ThoughtsInAChap)[], markedData: Array<Img|Footnote|Code> = []) {
	function isThought(mark: Updated | ThoughtsInAChap): mark is ThoughtsInAChap {
		return ('abstract' in mark && 'content' in mark);
	}
	function isUpdated(mark: Updated | ThoughtsInAChap): mark is Updated {
		return 'markText' in mark;
	}
	let prevMarkText = ""; // 保存上一条标注文本
	let prevMarkType = ""; // 保存上一次标注类型（0 标注 1 想法）
	let tempRes = ""; // 保存上一条处理后追加到 res 的标注文本
	let res: string[] = [], footnoteContent = "";
	for (let j = 0; j < marks.length; j++) { // 遍历章内标注
		let mark = marks[j];
		if (markedData.length) [marks[j], footnoteContent] = addMarkedData(marks[j], markedData, footnoteContent);
		if(isThought(mark)){ // 如果为想法
			// 想法
			let thouContent = `${Config.thouPre}${mark.content}${Config.thouSuf}\n\n`;
			// 想法所标注的内容
			const abstract = mark.abstract;
			let thouAbstract = `${Config.thouMarkPre}${abstract}${Config.thouMarkSuf}\n\n`;
			// 想法所对应文本与上一条标注相同时
			if (abstract === prevMarkText) {
				if (prevMarkType == '0') {
					// 如果只保留标注文本，则 thouAbstract 设为空
					if (Config.thoughtTextOptions === ThoughtTextOptions.JustMark) thouAbstract = '';
					// 如果只保留想法所对应的文本，将上一次追加得到的标注文本删掉
					else if (Config.thoughtTextOptions === ThoughtTextOptions.JustThought) {
						res.pop();
					}
				} else {
					// 多个想法对应相同的标注时，不重复记录标注内容
					if(Config.distinctThouMarks) thouAbstract = '';
				}
			}
			// 是否将想法添加到对应标注之前
			if (Config.thoughtFirst){
				res.push(thouContent + thouAbstract);
			} else {
				res.push(thouAbstract + thouContent);
			}
			prevMarkText = abstract;
			prevMarkType = '1'
		} else if(isUpdated(mark)){ // 不是想法（为标注）
			// 则进行正则匹配
			prevMarkText = mark.markText;
			prevMarkType = '0'
			tempRes = regexpReplace(prevMarkText);
			tempRes = `${addMarkPreAndSuf(tempRes, mark.style)}\n\n`;
			res.push(tempRes);
		}
	}
	if (markedData.length && footnoteContent) {
        res.push(footnoteContent);
    }
	return res.join("");
}

export async function getChapters(){
	const wereader = new Wereader(window.bookId);
	const chapInfos = await wereader.getChapInfos();
	const response = await sendMessageToContentScript({message: {isGetChapters: true}}) as responseType;
	if(!response || !chapInfos) {
		alert("获取目录出错。");
		return;
	}
	const chapsInServer = chapInfos.data[0].updated;
	const chapsFromDom = response.chapters;
	let checkedChaps = chapsInServer.map((chapInServer)=>{
		//某些书没有标题，或者读书页标题与数据库标题不同（往往读书页标题多出章节信息）
		if(chapsFromDom.length === chapsInServer.length &&
			!chapsFromDom.filter(chap => chap.title===chapInServer.title).length){
			// 将 chapsFromDom 中的信息赋值给 chapsFromServer
			if(chapsFromDom[chapInServer.chapterIdx-1])
				chapInServer.title = chapsFromDom[chapInServer.chapterIdx-1].title;
		}
		//某些书没有目录级别
		if(!chapInServer.level){
			let targetChapFromDom = chapsFromDom.filter(chap => chap.title===chapInServer.title);
			if(targetChapFromDom.length) chapInServer.level = targetChapFromDom[0].level;
			else chapInServer.level = 1;
		}
		chapInServer.isCurrent = chapInServer.title === response.currentContent || response.currentContent.indexOf(chapInServer.title)>-1
		return chapInServer;
	});
	// https://github.com/Higurashi-kagome/wereader/issues/76 start
	/* 判断从 DOM 获取的当前章节是否存在于 server 中（从 DOM 获取到的章节数可能多于 server 中的章节数，且当前章节为不存在于 server 中的某些子标题） */
	let isInServer = chapsInServer.filter(chap => {
		return (chap.title===response.currentContent 
			|| response.currentContent.indexOf(chap.title) > -1);
	}).length > 0;
	/* 不存在于 server 则在从 DOM 获取到的章节信息中向前找，找到一个存在于 server 中的目录，则将其作为当前目录 */
	if(!isInServer){
		for (let i = 0; i < chapsFromDom.length; i++) {
			// 在 chapsFromDom 找到当前章节
			if(chapsFromDom[i].title === response.currentContent) {
				// 从当前章节向前找，找到一个存在于 server 中的目录，则将其作为当前目录
				for (let j = i; j > -1; j--) {
					if (chapsInServer.filter(c => c.title===chapsFromDom[j].title).length) {
						response.currentContent = chapsFromDom[j].title;
						break;
					}
				}
				break;
			}
		}
	}
	// https://github.com/Higurashi-kagome/wereader/issues/76 end
	checkedChaps = chapsInServer.map((chapInServer)=>{
		chapInServer.isCurrent = 
			(chapInServer.title === response.currentContent
			|| response.currentContent.indexOf(chapInServer.title) > -1);
		return chapInServer;
	});
	return checkedChaps;
}

// 获取热门标注数据
export async function getBestBookMarks() {
	const wereader = new Wereader(window.bookId);
	let {items: bestMarksData} = await wereader.getBestBookmarks();
	//处理书本无热门标注的情况
	if(!bestMarksData || !bestMarksData.length){
		sendAlertMsg({text: "该书无热门标注",icon:'warning'});
		return;
	}
	//查找每章节热门标注
	let chapters = await getChapters() || [];
	let bestMarks = chapters.map((chap)=>{
		interface ChapInfoUpdatedExtra extends ChapInfoUpdated{
			bestMarks?: any
		}
		let tempChap: ChapInfoUpdatedExtra = chap;
		//取得章内热门标注并初始化 range
		let bestMarksInAChap = 
			bestMarksData.filter((bestMark)=>bestMark.chapterUid == tempChap.chapterUid)
			.reduce((tempBestMarksInAChap: Item[], curBestMark)=>{
				curBestMark.range = parseInt(curBestMark.range.toString().replace(/(\d*)-\d*/, "$1"));
				tempBestMarksInAChap.push(curBestMark);
				return tempBestMarksInAChap;
		},[]);
		//排序章内标注并加入到章节内
		tempChap.bestMarks = sortByKey(bestMarksInAChap, "range");;
		return tempChap;
	});
	return bestMarks;
}

// 获取想法
export interface ThoughtsInAChap{
	range: string;
	abstract: string;
	content: string
}
export async function getMyThought() {
	const wereader = new Wereader(window.bookId);
	let data = await wereader.getThoughts();
	//获取 chapterUid 并去重、排序
	let chapterUidArr = Array.from(new Set(JSON.stringify(data).match(/(?<="chapterUid":\s*)(\d*)(?=,)/g))).map((uid)=>{
		return parseInt(uid);
	});
	chapterUidArr.sort()
	//查找每章节标注并总结好
	let thoughtsMap: Map<number, ThoughtsInAChap[]> = new Map<number, ThoughtsInAChap[]>();
	//遍历章节
	chapterUidArr.forEach(chapterUid=>{
		let thoughtsInAChap: ThoughtsInAChap[] = [];
		//遍历所有想法，将章内想法放入一个数组
		for (const item of data.reviews) {
			//处理有书评的情况
			if (item.review.chapterUid == undefined || item.review.chapterUid != chapterUid) continue
			//找到指定章节的想法
			let abstract = item.review.abstract
			//替换想法前后空字符
			let content = item.review.content?.replace(/(^\s*|\s*$)/g,'') ?? '';
			let range = item.review.range
			//如果没有发生替换（为章末想法时发生）
			if(range == null || typeof range.valueOf() !== 'string' || range.indexOf('-') < 0){
				abstract = "章末想法";
				range = item.review.createTime.toString();
			}else{
				range = range.replace(/(\d*)-\d*/, "$1");
			}
			thoughtsInAChap.push({ abstract: abstract, content: content, range: range })
		}
		thoughtsMap.set(chapterUid, sortByKey(thoughtsInAChap, "range") as ThoughtsInAChap[])
	});
	return thoughtsMap;
}

// 在标注中添加想法
async function addThoughts(chaptersAndMarks: ChapAndMarks[], chapters: ChapInfoUpdated[]){
	let chapsMap = chapters.reduce((tempChapsMap, aChap)=>{
		// 整理格式
		tempChapsMap.set(aChap.chapterUid, aChap);
		return tempChapsMap;
	}, new Map<number, ChapInfoUpdated>());
	let thoughtsMap = await getMyThought();
	// 遍历各章节想法
	thoughtsMap.forEach((thoughtsInAChap, chapterUid) => {
		// 遍历章节依次将各章节章内想法添加进 marks
		let addedToMarks = false
		for(let i=0; i<chaptersAndMarks.length; i++){
			if(chaptersAndMarks[i].chapterUid != chapterUid) continue;
			// 找到想法所在章节
			// 想法与标注合并后按 range 排序
			let marks = chaptersAndMarks[i].marks.concat(thoughtsInAChap);
			chaptersAndMarks[i].marks = sortByKey(marks, "range") as Updated[];
			addedToMarks = true;
			break;
		}
		// 如果想法未被成功添加进标注（想法所在章节不存在标注的情况下发生）
		if(!addedToMarks) {
			let m = chapsMap.get(chapterUid);
			chaptersAndMarks.push({
				isCurrent: m !== undefined && m.isCurrent,
				level: m === undefined ? 0 : m.level ,
				chapterUid: chapterUid,
				title: m === undefined ? "" : m.title,
				marks: thoughtsInAChap
			});
		}
	});
	// 章节排序
	let sorted = sortByKey(chaptersAndMarks, "chapterUid") as ChapAndMarks[];
	return sorted;
}

// 给 markText 进行正则替换
function regexpReplace(markText: string){
	let regexpConfig = Config.re
	for(let reId in regexpConfig){
		let replaceMsg = regexpConfig[reId as keyof reConfigCollectionType].replacePattern.match(/^s\/(.+?)\/(.*?)\/(\w*)$/)
		if(!regexpConfig[reId as keyof reConfigCollectionType].checked
			|| replaceMsg == null
			|| replaceMsg.length < 4){//检查是否选中以及是否满足格式
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
function addMarkPreAndSuf(markText: string, style: number){

	const pre = (style == 0) ? Config["s1Pre"]
	: (style == 1) ? Config["s2Pre"]
	: (style == 2) ? Config["s3Pre"]
	: ""

	const suf = (style == 0) ? Config["s1Suf"]
	: (style == 1) ? Config["s2Suf"]
	: (style == 2) ? Config["s3Suf"]
	: ""
	
	return pre + markText + suf
}