export function getLocalStorage(key: string): Promise<any> {
	return new Promise((res, rej)=>{
		chrome.storage.local.get([key], function(local){
			if(chrome.runtime.lastError){
				rej(chrome.runtime.lastError.message)
			}else{
				res(local[key])
			}
		});
	})
}

export function getSyncStorage(key: string): Promise<any> {
	return new Promise((res, rej)=>{
		chrome.storage.sync.get([key], function(sync){
			if(chrome.runtime.lastError){
				rej(chrome.runtime.lastError.message)
			}else{
				res(sync[key])
			}
		});
	})
}