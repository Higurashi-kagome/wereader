/* 主要用于获取书本目录 */

//console.log("contents-getChapters.js：被注入，开始获取目录");

chrome.runtime.onMessage.addListener((request, sender, sendResponse)=>{
    let response = {chapters:[]}
    if(!request.isGetChapters) return;
    try{
        let childs = document.getElementsByClassName("readerCatalog_list")[0].childNodes
        for (let i = 0; i < childs.length; i++){
            let classname = childs[i].childNodes[0].className
            let level = classname.charAt(classname.length - 1)
            let textContent = childs[i].childNodes[0].childNodes[0].textContent
            //获取目录
            response.chapters.push({title: textContent, level: level})
        }
        let currentContent = ""
        if(document.getElementsByClassName("readerTopBar_title_chapter")[0]){
            //网页端为排版而可能添加空格以满足排版，所以添加正则替换开头和结尾的空格
            currentContent = document.getElementsByClassName("readerTopBar_title_chapter")[0].textContent.replace(/(^\s*|\s*$)/, '')
        }else{
            currentContent = document.getElementsByClassName("chapterItem chapterItem_current")[0].childNodes[0].childNodes[0].textContent
        }
        response.currentContent = currentContent
    }catch{
        console.warn("contents-getChapters.js：获取目录失败")
    }
	sendResponse(response);
});
