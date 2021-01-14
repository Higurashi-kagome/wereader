//获取当前背景页配置——用于测试
function getConfig(){
	return Config
}

//获取当前存储设置——用于测试
function logStorage(area="sync"){
	if(["sync","local"].indexOf(area) > -1){
		chrome.storage[area].get(function(setting){
			console.log("************setting************")
			console.log(setting)
			console.log("************Config************")
			console.log(Config)
		})
	}else console.log("请传入sync或local")
}

//aler()——用于测试及通知
function aler(text){
	console.log(text)
}

function callgetBookMarks(){
	getContents(function(contents){
		getBookMarks(contents, function(data){
			console.log(JSON.stringify(data))
		})
	})
}

function callgetMyThought(){
	getMyThought(function(thoughts) {
		console.log(JSON.stringify(thoughts))
	})
}