import { getReadDetail, getShelfData } from "./worker-popup";
import { getBookMarks, getBestBookMarks, getChapters } from "./worker-popup-process";
import { copy } from "./worker-utils";
import { getBookId } from "./worker-vars";
import { Wereader } from "./types/Wereader";
import { getSyncStorage } from "../common/utils";

function logAndCopy(data: unknown, msg = '') {
	console.log(msg, data);
	copy(JSON.stringify(data));
}

/* 用于测试 */
export async function getTest(){

	const wereader = new Wereader(await getBookId());

	const logBookmarksJson = async ()=>{
		const data = await wereader.getBookmarks();
		logAndCopy(data, 'bookmarksJson');
	}

	const logStorage = ()=>{
		const storage: {
			sync: {[key: string]: unknown},
			local: {[key: string]: unknown}
		} = {sync: {}, local: {}};
		chrome.storage.sync.get(function(sync){
			storage.sync = sync;
			chrome.storage.local.get(function(local){
				storage.local = local;
				logAndCopy(storage, 'storage');
			});
		});
		
	}

	const logConfig = async ()=>{
		logAndCopy(await getSyncStorage(), 'Config');
	}

	const logGetBookMarks = async ()=>{
		const chapsAndMarks = await getBookMarks();
		if (chapsAndMarks) logAndCopy(chapsAndMarks, 'chapsAndMarks');
	}

	const logBestBookMarks = async ()=>{
		const bestBookmarks = await getBestBookMarks();
		if (bestBookmarks) logAndCopy(bestBookmarks, 'bestBookmarks');
	}

	const logGetChapters = async ()=>{
		const chapters = await getChapters();
		if (chapters) logAndCopy(chapters, 'chapters');
	}

	const logChapInfosInServer = async ()=>{
		const data = await wereader.getChapInfos();
		logAndCopy(data, 'chapInfosInServer');
	}

	const logBookInfosInServer = async ()=>{
		const data = await wereader.getBookInfo();
		logAndCopy(data, 'logBookInfosInServer');
	}

	const logFuncGetShelfData = async ()=>{
		const shelfData = await getShelfData();
		logAndCopy(shelfData, 'shelfData');
	}

	const logFuncWereaderGetShelfData = async ()=>{
		const wereaderShelfData = await wereader.getShelfData();
		logAndCopy(wereaderShelfData, 'wereaderShelfData');
	}

	const logReadDetail = async ()=>{
		const readDetail = await getReadDetail();
		logAndCopy(readDetail, 'readDetail');
		// logAndCopy(1609430400, await getReadDetail(1, 3);
		// console.log(await getReadDetail(0));
	}

	const logThoughtJson = async ()=>{
		const thoughts = await wereader.getThoughts();
		logAndCopy(thoughts, 'thoughts');
	}

	const functions = {
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