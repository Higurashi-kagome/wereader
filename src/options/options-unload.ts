import $ from "jquery";
import { getRegexpSet } from "./options-utils";

function initUnload() {
	// 处理直接关闭设置页时 onchange 事件不触发的情况
	$(function () {
		window.onbeforeunload = function(){
			let activeElement = document.activeElement
			if(activeElement && (activeElement.nodeName == "INPUT" || activeElement.nodeName == "TEXTAREA")){
				const regexpSet: {
					key: string;
					value: {
						[key: string]: any;
						checked?: boolean | undefined;
					};
					currentProfile?: string
				} = getRegexpSet()
				regexpSet.currentProfile = $("#profileNamesInput").val() as string
				chrome.runtime.sendMessage({type:"saveRegexpOptions", regexpSet:regexpSet})
				// TODO: 支持保存其他 input 内容
			}
		}
	})
}

export {initUnload};