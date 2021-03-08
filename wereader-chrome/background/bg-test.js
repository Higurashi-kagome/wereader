function getTest(){

	let logMarksJson = async function(){
		const bookmarklistUrl = `https://i.weread.qq.com/book/bookmarklist?bookId=${bookId}`;
		let response = await fetch(bookmarklistUrl);
		let data = await response.json();
		console.log(data);
	}

	let logStorage = function(area="sync"){
		if(["sync","local"].indexOf(area) > -1){
			chrome.storage[area].get(function(setting){
				console.log("************setting************")
				console.log(setting)
				console.log("************Config************")
				console.log(Config)
			})
		}else console.log("请传入sync或local");
	}

	let aler = function(msg){alert(msg)}

	let logConfig = function (){console.log(Config);}

	let logChapterInfo = async ()=>{
		const chapterInfos = `https://i.weread.qq.com/book/chapterInfos?bookIds=${bookId}&synckeys=0`
		let chapInfo = await _getData(chapterInfos);
		console.log(chapInfo);
	}

	let logContents = async ()=>{
		const contents = await getChapters();
		console.log(contents);
	}

	let logGetBookMarks = async ()=>{
		const chapsAndMarks = await getBookMarks();
		console.log(chapsAndMarks);
	}

	let trigMarkedDatajs = async ()=>{
		sendMessageToContentScript({message: {isGetMarkedData: true}});
	}

	let functions = {
		'logBookMarksJson': logMarksJson,
		'logStorage': logStorage,
		'logConfig': logConfig,
		'logChapterInfo': logChapterInfo,
		'logContents': logContents,
		'logGetBookMarks': logGetBookMarks,
		'trigMarkedDatajs': trigMarkedDatajs
	}

	return functions;
}