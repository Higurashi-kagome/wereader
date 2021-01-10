//获取当前背景页配置——用于测试
function getConfig(){
	return Config
}

//获取当前存储设置——用于测试
function getStorage(area="sync",callback=function(setting){}){
	if(["sync","local"].indexOf(area) > -1){
		chrome.storage[area].get(function(setting){
			callback(setting)
		})
	}else callback("请传入sync或local")
}

//aler()——用于测试及通知
function aler(text){
	console.log(text)
}