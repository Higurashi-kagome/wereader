/* 初始化笔记面板，为各个按钮绑定点击事件 */
window.addEventListener('load',async ()=>{
    if(!await bg.setBookId()) return window.close();
    const userVid = await bg.getUserVid();
    if (!userVid) {
        bg.getTest()['aler']('信息获取失败，请确保正常登陆后刷新重试。');
        return window.close();
    }
    //遍历按钮绑定点击事件
    const ids = ["getTextComment","getHtmlComment","getMarksInCurChap","getAllMarks","getContents","getBestBookMarks","getMyThoughts","trigCopyBtn","DeleteMarks"];
    ids.forEach(id=>{
        document.getElementById(id).addEventListener('click', listener);
    });
    //点击调用该函数
    function listener(event){
        let targetEl = event.target || event.srcElement;
        switch(targetEl.id){
            case "getTextComment":
                bg.getComment(userVid, false)
                break;
            case "getHtmlComment":
                bg.getComment(userVid, true)
                break;
            case "getMarksInCurChap":
                bg.copyBookMarks(false)
                break;
            case "getAllMarks":
                bg.copyBookMarks(true)
                break;
            case "getContents":
                bg.copyContents()
                break;
            case "getBestBookMarks":
                bg.copyBestBookMarks()
                break;
            case "getMyThoughts":
                bg.copyThought()
                break;
            case "trigCopyBtn":
                chrome.tabs.executeScript({ file: 'inject/inject-copyBtn.js' }, ()=>{
                    bg.catchErr("popup.js", "copyBtn");
                });
                break;
            case "DeleteMarks":
                chrome.tabs.executeScript({ file: 'inject/inject-deleteMarks.js' }, ()=>{
                    bg.catchErr("popup.js", "deleteMarks");
                });
                break;
            default:
                break;
        }
        window.close();
    }
});