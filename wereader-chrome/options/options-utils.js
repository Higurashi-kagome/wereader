//错误捕捉函数
function catchErr(sender) {
	if (chrome.runtime.lastError) {
        console.log(sender + " => chrome.runtime.lastError：\n" + chrome.runtime.lastError.message)
        return true
	}else{
        return false
    }
}

//设置 HTML 元素属性
function setAttributes(element,attributes){
	for(let key in attributes){
		if(Object.prototype.toString.call(attributes[key]) === '[object Object]'){
			setAttributes(element[key],attributes[key])
		}else{
			element[key] = attributes[key]
		}
	}
}

//更新 sync 和 local
function updateStorageArea(configMsg={},callback=function(){}){
    //存在异步问题，故设置用于处理短时间内需要进行多次设置的情况
    if(configMsg.setting && configMsg.settings){
        chrome.storage.sync.set(configMsg.setting,function(){
            if(catchErr("updateSyncAndLocal"))console.warn(STORAGE_ERRORMSG)
            chrome.storage.local.set(configMsg.settings,function(){
                if(catchErr("updateSyncAndLocal"))console.warn(STORAGE_ERRORMSG)
                callback()
            })  
        })
    }else if(configMsg.key != undefined){//不排除特殊键值，所以判断是否为 undefined
        let config = {}
        let key = configMsg.key
        let value = configMsg.value
        config[key] = value
        chrome.storage.sync.set(config,function(){
            if(catchErr("updateSyncAndLocal"))console.warn(STORAGE_ERRORMSG)
            chrome.storage.local.get(function(settings){
                const currentProfile = document.getElementById("profileNamesInput").value
                settings[BACKUPKEY][currentProfile][key] = value
                chrome.storage.local.set(settings,function(){
                    if(catchErr("updateSyncAndLocal"))console.warn(STORAGE_ERRORMSG)
                    callback()
                })
            })
        })
    }
}