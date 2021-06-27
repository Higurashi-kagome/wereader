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

	let logShelfHtml = ()=>{
		fetch('https://weread.qq.com/web/shelf').then(function(resp) {return resp.text()}).then(function(data) {
			var initdata = JSON.parse(data.match(/window\.__INITIAL_STATE__\=({.*?});/)[1])
			console.log(initdata);
		})
	}

	let logConfig = ()=>{
		console.log('Config', Config);
	}

	let logGetBookMarks = async ()=>{
		const chapsAndMarks = await getBookMarks();
		console.log('chapsAndMarks', chapsAndMarks);
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

	let logFuncGetShelfData = async ()=>{
		console.log(await getShelfData());
	}

	let logFuncWereaderGetShelfData = async ()=>{
		console.log(await wereader.getShelfData());
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