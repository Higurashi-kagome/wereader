function logAndCopy(data, msg = '') {
	console.log(msg, data);
	copy(data);
}

/* 用于测试 */
function getTest(){

	let wereader = new Wereader(bookId);

	let logBookmarksJson = async ()=>{
		const data = await wereader.getBookmarks();
		logAndCopy(data, 'bookmarksJson');
	}

	let logStorage = ()=>{
		let storage = {};
		chrome.storage.sync.get(function(sync){
			storage.sync = sync;
			chrome.storage.local.get(function(local){
				storage.local = local;
				logAndCopy(storage, 'storage');
			});
		});
		
	}

	let logShelfHtml = ()=>{
		fetch('https://weread.qq.com/web/shelf').then(function(resp) {return resp.text()}).then(function(data) {
			var initData = JSON.parse(data.match(/window\.__INITIAL_STATE__\=({.*?});/)[1])
			logAndCopy(initData, 'initData');
		})
	}

	let logConfig = ()=>{
		logAndCopy(Config, 'Config');
	}

	let logGetBookMarks = async ()=>{
		const chapsAndMarks = await getBookMarks();
		logAndCopy(chapsAndMarks, 'chapsAndMarks');
	}

	let logBestBookMarks = async ()=>{
		const bestBookmarks = await getBestBookMarks();
		logAndCopy(bestBookmarks, 'bestBookmarks');
	}

	let logGetChapters = async ()=>{
		const chapters = await getChapters();
		logAndCopy(chapters, 'chapters');
	}

	let logChapInfosInServer = async ()=>{
		const data = await wereader.getChapInfos();
		logAndCopy(data, 'chapInfosInServer');
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

	let functions = {
		'logBookmarksJson': logBookmarksJson,
		'logStorage': logStorage,
		'logConfig': logConfig,
		'logGetBookMarks': logGetBookMarks,
		'logBestBookMarks': logBestBookMarks,
		'logGetChapters': logGetChapters,
		'logChapInfosInServer': logChapInfosInServer,
		'logFuncGetShelfData': logFuncGetShelfData,
		'logFuncWereaderGetShelfData': logFuncWereaderGetShelfData,
		'logReadDetail': logReadDetail,
		'logShelfHtml': logShelfHtml
	}

	return functions;
}