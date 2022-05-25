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
			curMark.range = curMark.range.replace(/(\d*)-\d*/, "$1");
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
function addMarkedData(mark: any, markedData: any, footnoteContent: string) {
	let abstract = mark.abstract;
	let markText = abstract ? abstract : mark.markText;
	for (const markedDataIdx of mark.markedDataIdxes) { // 遍历索引，逐个替换
		const {imgSrc, alt, isInlineImg, footnote, footnoteName, code} = markedData[markedDataIdx];
		let replacement = '';
		/* 生成替换字符串 */
		if(imgSrc) { // 图片
			let insert1 = '', insert2 = ''; // 非行内图片单独占行（即使它与文字一起标注）
			if(!isInlineImg && markText.indexOf('[插图]') > 0) // 不为行内图片且'[插图]'前有内容
				insert1 = '\n\n'
			if(!isInlineImg && markText.indexOf('[插图]') != (markText.length - 4)) // 不为行内图片且'[插图]'后有内容
				insert2 = '\n\n'
			replacement = `${insert1}![${alt}](${imgSrc})${insert2}`
		}else if (footnote) { //注释
			const footnoteId = footnoteName.replace(/[\s<>"]/, '-');
			const footnoteNum = footnoteName.match(/(?<=注)(\d)*$/)[0];
			replacement = `<sup><a id="${footnoteId}-ref" href="#${footnoteId}">${footnoteNum}</a></sup>`;
			footnoteContent += `<p id="${footnoteId}">${footnoteNum}. ${footnote}<a href="#${footnoteId}-ref">&#8617;</a></p>\n`;
		}else if (code) { //代码块
			let insert1 = '', insert2 = ''
			if(markText.indexOf('[插图]') > 0) //'[插图]'前有内容
				insert1 = '\n\n'
			if(markText.indexOf('[插图]') != (markText.length - 4)) //'[插图]'后有内容
				insert2 = '\n\n'
			replacement = `${insert1}${Config.codePre}\n${code}${Config.codeSuf}${insert2}`
		}
		if (replacement) { // 替换
			markText = markText.replace(/\[插图\]/, replacement);
			if (abstract) mark.abstract = markText; // 新字符串赋值回 mark
			else mark.markText = markText;
		} else console.log(mark, markedData, replacement);
	}
	// footnoteContent 不断更新，最后在 traverseMarks 中追加到文字末尾
	return [mark, footnoteContent];
}

// 在 marks 中添加替换数据索引（每一个“[插图]”用哪个位置的 markedData 替换）
export function addRangeIndexST(marks: any) {
	let used: {[key: string]: any} = {}; // “[插图]”的 range 作为键，该“[插图]”所对应的数据在 markedData 中的索引作为值
	// 获得 str 中子字符串 subStr 出现的所有位置（返回 index 数组）
	function getIndexes(str: string, subStr: string){
		let indexes  = [];
		var idx = str.indexOf(subStr);
		while(idx > -1){
			indexes.push(idx);
			idx = str.indexOf(subStr, idx+1);
		}
		return indexes;
	}
	const name = '[插图]';
	let markedDataIdx = 0; // markedData 索引
	for (let i = 0; i < marks.length; i++) { // 遍历标注
		let {abstract, range} = marks[i];
		let markText = abstract ? abstract : marks[i].markText;
		let indexes = getIndexes(markText, name);
		let markedDataIdxes = [];
		for (const idx of indexes) { // indexes：所有“[插图]”在 markText 中出现的位置
			// idx：某一个“[插图]”在 markText 中的位置
			let imgRange = range + idx;  // 每一个“[插图]”在本章标注中的唯一位置
			if (used[imgRange] == undefined) { // 该“[插图]”没有记录过
				used[imgRange] = markedDataIdx; // 记录某个位置的“[插图]”所对应的替换数据
				markedDataIdxes.push(markedDataIdx++);
			} else { // “[插图]”被记录过（同一个“[插图]”多次出现）
				markedDataIdxes.push(used[imgRange]);
			}
		}
		marks[i].markedDataIdxes = markedDataIdxes;
	}
	return marks;
}

// 处理章内标注
export function traverseMarks(marks: (Updated | ThoughtsInAChap)[], markedData: Array<Img|Footnote|Code> = []) {
	function isThought(mark: object): mark is ThoughtsInAChap {
		return ('abstract' in mark && 'content' in mark);
	}
	function isUpdated(mark: object): mark is Updated {
		return 'markText' in mark;
	}
	let prevMarkText = ""; // 保存上一条标注文本
	let tempRes = ""; // 保存上一条处理后追加到 res 的标注文本
	let res = "", footnoteContent = "";
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
				// 如果只保留标注文本，则 thouAbstract 设为空
				if (Config.thoughtTextOptions === ThoughtTextOptions.JustMark) thouAbstract = '';
				// 如果只保留想法所对应的文本，将上一次追加得到的标注文本（tempRes）删掉
				else if (Config.thoughtTextOptions === ThoughtTextOptions.JustThought) {
					res = res.replace(new RegExp( escapeRegExp(tempRes) + `$`), "");
				}
				prevMarkText = '';
			}
			// 是否将想法添加到对应标注之前
			if (Config.thoughtFirst){
				res += (thouContent + thouAbstract);
			} else {
				res += (thouAbstract + thouContent);
			}
		} else if(isUpdated(mark)){ // 不是想法（为标注）
			// 则进行正则匹配
			prevMarkText = mark.markText;
			tempRes = regexpReplace(prevMarkText);
			tempRes = `${addMarkPreAndSuf(tempRes, mark.style)}\n\n`;
			res += tempRes;
		}
	}
	if (markedData.length && footnoteContent)
		res += footnoteContent;
	return res;
}

export async function getChapters(){
	const wereader = new Wereader(window.bookId);
	const chapInfos = await wereader.getChapInfos();
	const response = await sendMessageToContentScript({message: {isGetChapters: true}}) as responseType;
	if(!response || !chapInfos) {
		alert("获取目录出错。");
		return;
	}
	const chaps = chapInfos.data[0].updated;
	let checkedChaps = chaps.map((chap)=>{
		let chapsFromDom = response.chapters;
		//某些书没有标题，或者读书页标题与数据库标题不同（往往读书页标题多出章节信息）
		if(!chapsFromDom.filter((chap: any)=>chap.title===chap.title).length){
			// 将 chapsFromDom 中的信息赋值给 chapsFromServer
			if(chapsFromDom[chap.chapterIdx-1]) chap.title = chapsFromDom[chap.chapterIdx-1].title;
		}
		//某些书没有目录级别
		if(!chap.level){
			let targetChapFromDom = chapsFromDom.filter((chapter: any)=>chapter.title===chap.title);
			if(targetChapFromDom.length) chap.level = targetChapFromDom[0].level;
			else  chap.level = 1;
		}
		chap.isCurrent = chap.title === response.currentContent || response.currentContent.indexOf(chap.title)>-1
		return chap;
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
			let content = item.review.content.replace(/(^\s*|\s*$)/g,'')
			let range = item.review.range.replace(/(\d*)-\d*/, "$1")
			//如果没有发生替换（为章末想法时发生）
			if(item.review.range.indexOf('-') < 0){
				abstract = "章末想法";
				range = item.review.createTime.toString();
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