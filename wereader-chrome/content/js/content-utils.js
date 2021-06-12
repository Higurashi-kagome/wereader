/* 供其他 content.js 调用的函数 */

//获取当前目录
function getCurrentChapTitle(){
    let currentChapTitle = '';
    if(document.getElementsByClassName("readerTopBar_title_chapter")[0]){
        currentChapTitle = document.getElementsByClassName("readerTopBar_title_chapter")[0].textContent;
    }else{
        currentChapTitle = document.getElementsByClassName("chapterItem chapterItem_current")[0].childNodes[0].childNodes[0].textContent;
    }
    currentChapTitle = currentChapTitle.replace(/^\s*|\s*$/,'');
    return currentChapTitle;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

//设置属性
function setAttributes(element,attributes){
	for(let key in attributes){
		if(Object.prototype.toString.call(attributes[key]) === '[object Object]'){
			setAttributes(element[key],attributes[key])
		}else{
			element[key] = attributes[key]
		}
	}
}

async function copy(targetText){
    try {
        await navigator.clipboard.writeText(targetText);
        console.log('Copied to clipboard');
    } catch (err) {
        alert('Failed to copy: ', err);
    }
}