import { getReadDetail, getShelfData } from "./bg-popup";
import { getBookMarks, getBestBookMarks, getChapters } from "./bg-popup-process";
import { copy } from "./bg-utils";
import { Config } from "./bg-vars";
import { Wereader } from "./bg-wereader-api";

function logAndCopy(data: object, msg = '') {
	console.log(msg, data);
	copy(JSON.stringify(data));
}

/* 用于测试 */
export function getTest(){

	let wereader = new Wereader(window.bookId);

	let logBookmarksJson = async ()=>{
		const data = await wereader.getBookmarks();
		logAndCopy(data, 'bookmarksJson');
	}

	let logStorage = ()=>{
		let storage: {
			sync: {[key: string]: any},
			local: {[key: string]: any}
		} = {sync: {}, local: {}};
		chrome.storage.sync.get(function(sync){
			storage.sync = sync;
			chrome.storage.local.get(function(local){
				storage.local = local;
				logAndCopy(storage, 'storage');
			});
		});
		
	}

	let logConfig = ()=>{
		logAndCopy(Config, 'Config');
	}

	let logGetBookMarks = async ()=>{
		const chapsAndMarks = await getBookMarks();
		if (chapsAndMarks) logAndCopy(chapsAndMarks, 'chapsAndMarks');
	}

	let logBestBookMarks = async ()=>{
		const bestBookmarks = await getBestBookMarks();
		if (bestBookmarks) logAndCopy(bestBookmarks, 'bestBookmarks');
	}

	let logGetChapters = async ()=>{
		const chapters = await getChapters();
		if (chapters) logAndCopy(chapters, 'chapters');
	}

	let logChapInfosInServer = async ()=>{
		const data = await wereader.getChapInfos();
		logAndCopy(data, 'chapInfosInServer');
	}

	let logBookInfosInServer = async ()=>{
		const data = await wereader.getBookInfo();
		logAndCopy(data, 'logBookInfosInServer');
	}

	let logFuncGetShelfData = async ()=>{
		const shelfData = await getShelfData();
		logAndCopy(shelfData, 'shelfData');
	}

	let logFuncWereaderGetShelfData = async ()=>{
		const wereaderShelfData = await wereader.getShelfData();
		logAndCopy(wereaderShelfData, 'wereaderShelfData');
	}

	let logReadDetail = async ()=>{
		const readDetail = await getReadDetail();
		logAndCopy(readDetail, 'readDetail');
		// logAndCopy(1609430400, await getReadDetail(1, 3);
		// console.log(await getReadDetail(0));
	}

	let logThoughtJson = async ()=>{
		const thoughts = await wereader.getThoughts();
		logAndCopy(thoughts, 'thoughts');
	}

	let functions = {
		logBookInfosInServer,
		logBookmarksJson,
		logStorage,
		logConfig,
		logGetBookMarks,
		logBestBookMarks,
		logGetChapters,
		logChapInfosInServer,
		logFuncGetShelfData,
		logFuncWereaderGetShelfData,
		logReadDetail,
		logThoughtJson
	}

	return functions;
}