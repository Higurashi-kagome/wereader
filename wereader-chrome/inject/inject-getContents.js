/* 主要用于获取书本目录 */

//console.log("inject-getContents.js：被注入，开始获取目录");
try{
    let childs = document.getElementsByClassName("readerCatalog_list")[0].childNodes
    let texts = []
    for (let i = 0; i < childs.length; i++){
        let classname = childs[i].childNodes[0].className
        let level = classname.charAt(classname.length - 1)
        let textContent = childs[i].childNodes[0].childNodes[0].textContent
        //获取目录
        texts.push(level + textContent)
        //悬停显示目录级别
        childs[i].title = `level${level}`
    }
    let currentContent = ""
    if(document.getElementsByClassName("readerTopBar_title_chapter")[0]){
        currentContent = document.getElementsByClassName("readerTopBar_title_chapter")[0].textContent
    }else{
        currentContent = document.getElementsByClassName("chapterItem chapterItem_current")[0].childNodes[0].childNodes[0].textContent
    }
    //传消息给后台
    chrome.runtime.sendMessage({type: "getContents", contents: texts, currentContent: currentContent})
}catch{
    console.warn("inject-getContents.js：获取目录失败")
}
