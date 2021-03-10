/* 存放全局变量 */

// 属性设置函数，后面的脚本中会用到
const setAttributes = (element,attributes)=>{
	for(let key in attributes){
		if(Object.prototype.toString.call(attributes[key]) === '[object Object]'){
			setAttributes(element[key],attributes[key])
		}else{
			element[key] = attributes[key]
		}
	}
};

// 背景页，后面会用到
const bg = chrome.extension.getBackgroundPage();

