import { initConfigSelect } from "./options-config-edit";
import { initCurrentConfig } from "./options-config-init";
import { initExpandBtn } from "./options-expand";
import { initPrompt } from "./options-prompt";
import { initRegexp } from "./options-regexp";
import { initUnload } from "./options-unload";
import { getRegexpSet } from "./options-utils";

//入口
function main(){
	chrome.storage.sync.get(function(setting) {
		console.log("********************************************")
		console.log("storage.sync", setting)
		chrome.storage.local.get(function(settings){
			console.log("storage.local", settings)
			console.log("********************************************")
			initialize(setting,settings);
			initUnload();
		})
	})
}

//初始化
function initialize(setting: { [key: string]: any}, settings: { [key: string]: any}){
	initExpandBtn();
	initPrompt();
	initConfigSelect(setting, settings);
	initCurrentConfig(setting);
	initRegexp(setting);
}

export {main, getRegexpSet};