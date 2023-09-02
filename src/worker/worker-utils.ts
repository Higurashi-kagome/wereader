import { SweetAlertOptions } from 'sweetalert2';

import { regexpSetType } from '../options/options-unload';
import {
    BackupKey,
    StorageErrorMsg,
} from './worker-vars';
import { Wereader } from './types/Wereader';
import { Sender } from '../common/sender';

// 获得 str 中子字符串 subStr 出现的所有位置（返回 index 数组）
export function getIndexes(str: string, subStr: string){
    const indexes  = [];
    let idx = str.indexOf(subStr);
    while(idx > -1){
        indexes.push(idx);
        idx = str.indexOf(subStr, idx+1);
    }
    return indexes;
}

// 报错捕捉函数
function catchErr(...sender: unknown[]) {
	if(!chrome.runtime.lastError)return false;
	console.log(`${sender.join('=>')}=>chrome.runtime.lastError`, chrome.runtime.lastError.message);
	return true;
}

// 更新 sync 和 local ——处理设置页 onchange 不生效的问题
function updateStorageAreaInBg(configMsg: regexpSetType = {},callback=function(){}){
	//存在异步问题，故设置用于处理短时间内需要进行多次设置的情况
	if(configMsg.key === undefined) return;
	const config: {[key: string]: unknown} = {};
	const {key, value} = configMsg;
	config[key] = value;
	chrome.storage.sync.set(config, function(){
		if(catchErr("bg.updateSyncAndLocal"))console.error(StorageErrorMsg)
		chrome.storage.local.get(function(settings){
			const currentProfile = configMsg.currentProfile!
			settings[BackupKey][currentProfile][key] = value
			chrome.storage.local.set(settings,function(){
				if(catchErr("bg.updateSyncAndLocal"))console.error(StorageErrorMsg)
				callback()
			})
		})
	})
}

async function sendMessageToContentScript(sendMsg: { tabId?: number; message: unknown; }){
	return new Promise((res, rej)=>{
		const callbackHandler = (response: unknown)=>{
			if(chrome.runtime.lastError) return rej();
			if(response) return res(response);
		}
	
		if(sendMsg.tabId != undefined){
			chrome.tabs.sendMessage(sendMsg.tabId, sendMsg.message, callbackHandler);
		}else{
			chrome.tabs.query({active: true, currentWindow: true}, (tabs)=>{
				if(!tabs[0]) return rej();
				chrome.tabs.sendMessage(tabs[0].id!, sendMsg.message, callbackHandler);
			});
		}
	}).catch((error)=>{console.log(error);});
}

async function getCurTab(): Promise<chrome.tabs.Tab> {
	return new Promise((res, rej)=>{
		chrome.tabs.query({active: true, currentWindow: true}, (tabs)=>{
			if(!tabs[0]) return rej('未找到当前 tab');
			return res(tabs[0])
		});
	})
}

async function sendAlertMsg(msg: SweetAlertOptions, tabId: number | undefined = undefined) {
	const response = await sendMessageToContentScript({tabId: tabId, message: {isAlertMsg: true, alertMsg: msg}});
	return response;
}

/**
 * 复制文本（发消息给 content，由 content 处理）
 * @param text 待复制内容
 */
function copy(text: string) {
	new Sender('copy', text).sendToOffscreen()
}

/**
 * 复制文本内容
 * @param text 待复制文本
 */
export async function navCopy(text: string) {
	try {
		await navigator.clipboard.writeText(text);
		sendMessageToContentScript({message: {isAlertMsg: true, alertMsg: {icon: 'success', title: '复制成功'}}})
	} catch (err) {
		console.error('复制失败：', err);
		console.error("待复制文本", text);
		sendMessageToContentScript({message: {isAlertMsg: true, alertMsg: {text: "复制出错", icon: 'warning'}}})
	}
}

async function getJson(url: string){
	try {
		const resp = await fetch(url, {
			credentials: "include", 
			cache: 'no-cache'
		});
		console.log('resp', resp);
		const json = await resp.json();
		return json;
	} catch (error) {
		sendAlertMsg({title: "获取失败:", text: JSON.stringify(error), icon: "error", confirmButtonText: '确定'});
	}
}

async function getText(url: string){
	try {
		const resp = await fetch(url, {credentials:'include', cache: 'no-cache'});
		console.log('resp', resp);
		const text = await resp.text();
		return text;
	} catch (error) {
		sendAlertMsg({title: "获取失败:", text: JSON.stringify(error), icon: "error", confirmButtonText: '确定'});
	}
}

/* eslint-disable */
function puzzling(t: string | number) {
    const MD5 = function(d: any){const r = M(V(Y(X(d),8*d.length)));return r.toLowerCase()};function M(d: any){for(var _,m="0123456789ABCDEF",f="",r=0;r<d.length;r++)_=d.charCodeAt(r),f+=m.charAt(_>>>4&15)+m.charAt(15&_);return f}function X(d: any){for(var _=Array(d.length>>2),m=0;m<_.length;m++)_[m]=0;for(m=0;m<8*d.length;m+=8)_[m>>5]|=(255&d.charCodeAt(m/8))<<m%32;return _}function V(d: any){for(var _="",m=0;m<32*d.length;m+=8)_+=String.fromCharCode(d[m>>5]>>>m%32&255);return _}function Y(d: any,_: any){d[_>>5]|=128<<_%32,d[14+(_+64>>>9<<4)]=_;for(var m=1732584193,f=-271733879,r=-1732584194,i=271733878,n=0;n<d.length;n+=16){const h=m,t=f,g=r,e=i;f=md5_ii(f=md5_ii(f=md5_ii(f=md5_ii(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_ff(f=md5_ff(f=md5_ff(f=md5_ff(f,r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+0],7,-680876936),f,r,d[n+1],12,-389564586),m,f,d[n+2],17,606105819),i,m,d[n+3],22,-1044525330),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+4],7,-176418897),f,r,d[n+5],12,1200080426),m,f,d[n+6],17,-1473231341),i,m,d[n+7],22,-45705983),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+8],7,1770035416),f,r,d[n+9],12,-1958414417),m,f,d[n+10],17,-42063),i,m,d[n+11],22,-1990404162),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+12],7,1804603682),f,r,d[n+13],12,-40341101),m,f,d[n+14],17,-1502002290),i,m,d[n+15],22,1236535329),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+1],5,-165796510),f,r,d[n+6],9,-1069501632),m,f,d[n+11],14,643717713),i,m,d[n+0],20,-373897302),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+5],5,-701558691),f,r,d[n+10],9,38016083),m,f,d[n+15],14,-660478335),i,m,d[n+4],20,-405537848),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+9],5,568446438),f,r,d[n+14],9,-1019803690),m,f,d[n+3],14,-187363961),i,m,d[n+8],20,1163531501),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+13],5,-1444681467),f,r,d[n+2],9,-51403784),m,f,d[n+7],14,1735328473),i,m,d[n+12],20,-1926607734),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+5],4,-378558),f,r,d[n+8],11,-2022574463),m,f,d[n+11],16,1839030562),i,m,d[n+14],23,-35309556),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+1],4,-1530992060),f,r,d[n+4],11,1272893353),m,f,d[n+7],16,-155497632),i,m,d[n+10],23,-1094730640),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+13],4,681279174),f,r,d[n+0],11,-358537222),m,f,d[n+3],16,-722521979),i,m,d[n+6],23,76029189),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+9],4,-640364487),f,r,d[n+12],11,-421815835),m,f,d[n+15],16,530742520),i,m,d[n+2],23,-995338651),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+0],6,-198630844),f,r,d[n+7],10,1126891415),m,f,d[n+14],15,-1416354905),i,m,d[n+5],21,-57434055),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+12],6,1700485571),f,r,d[n+3],10,-1894986606),m,f,d[n+10],15,-1051523),i,m,d[n+1],21,-2054922799),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+8],6,1873313359),f,r,d[n+15],10,-30611744),m,f,d[n+6],15,-1560198380),i,m,d[n+13],21,1309151649),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+4],6,-145523070),f,r,d[n+11],10,-1120210379),m,f,d[n+2],15,718787259),i,m,d[n+9],21,-343485551),m=safe_add(m,h),f=safe_add(f,t),r=safe_add(r,g),i=safe_add(i,e)}return [m,f,r,i]}function md5_cmn(d: any,_: any,m: any,f: any,r: any,i: any){return safe_add(bit_rol(safe_add(safe_add(_,d),safe_add(f,i)),r),m)}function md5_ff(d: any,_: any,m: any,f: any,r: any,i: any,n: any){return md5_cmn(_&m|~_&f,d,_,r,i,n)}function md5_gg(d: any,_: any,m: any,f: any,r: any,i: any,n: any){return md5_cmn(_&f|m&~f,d,_,r,i,n)}function md5_hh(d: any,_: any,m: any,f: any,r: any,i: any,n: any){return md5_cmn(_^m^f,d,_,r,i,n)}function md5_ii(d: any,_: any,m: any,f: any,r: any,i: any,n: any){return md5_cmn(m^(_|~f),d,_,r,i,n)}function safe_add(d: any,_: any){const m=(65535&d)+(65535&_);return(d>>16)+(_>>16)+(m>>16)<<16|65535&m}function bit_rol(d: any,_: any){return d<<_|d>>>32-_}
    
    if ("number" == typeof t && (t = t.toString()),
    "string" != typeof t)
        return t;
    let e = MD5(t)
      , n = e.substr(0, 3)
      , r = function(t) {
        if (/^\d*$/.test(t)) {
            for (var e = t.length, n = [], r = 0; r < e; r += 9) {
                const i = t.slice(r, Math.min(r + 9, e));
                n.push(parseInt(i).toString(16))
            }
            return ["3", n]
        }
        for (var o = "", a = 0; a < t.length; a++) {
            o += t.charCodeAt(a).toString(16)
        }
        return ["4", [o]]
    }(t);
    n += r[0],
    n += 2 + e.substr(e.length - 2, 2);
    for (let i = r[1], o = 0; o < i.length; o++) {
        let a = i[o].length.toString(16);
        1 === a.length && (a = "0" + a),
        n += a,
        n += i[o],
        o < i.length - 1 && (n += "g")
    }
    return n.length < 20 && (n += e.substr(0, 20 - n.length)),
    n += MD5(n).substr(0, 3)
}
/* eslint-enable */

function createTab (obj: chrome.tabs.CreateProperties) {
    return new Promise(resolve => {
        chrome.tabs.create(obj, async tab => {
            chrome.tabs.onUpdated.addListener(function listener (tabId, info) {
                if (info.status === 'complete' && tabId === tab.id) {
                    chrome.tabs.onUpdated.removeListener(listener);
                    resolve(tab);
                }
            });
        });
    });
}

async function getUserVid(url?: string){
	return new Promise((res, rej) => {
		if(!url) url = Wereader.maiUrl;
		chrome.cookies.get({url: url, name: 'wr_vid'}, (cookie) => {
			if(catchErr('getUserVid') || !cookie) return rej(null);
			return res(cookie.value.toString());
		});
	}).catch(()=>{ });
}

export {
    catchErr,
    copy,
    createTab,
    getJson,
    getText,
    getUserVid,
    puzzling,
    sendAlertMsg,
    sendMessageToContentScript,
    updateStorageAreaInBg,
	getCurTab
};