/* 用于测试 */
function getTest(){

	let wereader = new Wereader(bookId);

	let logBookmarksJson = async ()=>{
		const data = await wereader.getBookmarks();
		console.log('bookmarksJson', data);
	}

	let logStorage = ()=>{
		chrome.storage.sync.get(function(sync){
			console.log('storage.sync', sync);
		});
		chrome.storage.local.get(function(local){
			console.log('storage.local', local);
		});
	}

	let logConfig = ()=>{
		console.log('Config', Config);
	}

	let logGetBookMarks = async ()=>{
		const chapsAndMarks = await getBookMarks();
		console.log('chapsAndMarks', chapsAndMarks);
	}

	let trigMarkedDatajs = async ()=>{
		sendMessageToContentScript({message: {isGetMarkedData: true}});
	}

	let logBestBookMarks = async ()=>{
		const bestbookmarks = await getBestBookMarks();
		console.log('bestbookmarks', bestbookmarks);
	}

	let logGetChapters = async ()=>{
		const chapters = await getChapters();
		console.log('chapters', chapters);
	}

	let logChapInfosInServer = async ()=>{
		const data = await wereader.getChapInfos();
		console.log('chapInfosInServer', data);
	}

	let logShelfData = async ()=>{
		console.log(await getShelfData());
	}

	let logShelfHtml = async ()=>{
		console.log(await getShelfHtml());
	}

	let logReadDetail = async ()=>{
		console.log(await getReadDetail());
		// console.log(await getReadDetail(1, 3, 1609430400));
		console.log(await getReadDetail(0));
	}

	let functions = {
		'logBookmarksJson': logBookmarksJson,
		'logStorage': logStorage,
		'logConfig': logConfig,
		'logGetBookMarks': logGetBookMarks,
		'trigMarkedDatajs': trigMarkedDatajs,
		'logBestBookMarks': logBestBookMarks,
		'logGetChapters': logGetChapters,
		'logChapInfosInServer': logChapInfosInServer,
		'logShelfData': logShelfData,
		'logShelfHtml': logShelfHtml,
		'logReadDetail': logReadDetail
	}

	return functions;
}