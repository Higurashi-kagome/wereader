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

	let functions = {
		'logBookMarksJson': logMarksJson,
		'logStorage': logStorage,
		'logConfig': logConfig,
		'aler': aler
	}

	return functions;
}