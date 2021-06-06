/* 初始化笔记面板，为各个按钮绑定点击事件 */
window.addEventListener('load',async ()=>{
    if(!await bg.setBookId()) return window.close();
    const userVid = await bg.getUserVid();
    if (!userVid) {
        bg.alert('信息获取失败，请确保正常登陆后刷新重试');
        return window.close();
    }
    //遍历按钮绑定点击事件
    document.querySelectorAll('.caller').forEach(el=>{
        el.addEventListener('click', listener);
    });
    //点击调用该函数
    function listener(event){
        let targetEl = event.target || event.srcElement;
        switch(targetEl.id){
            case "getTextComment":
                bg.copyComment(userVid, false)
                break;
            case "getHtmlComment":
                bg.copyComment(userVid, true)
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
            case "removeMarksInCurChap":
                bg.sendMessageToContentScript({message:{deleteBookmarks:true, isAll: false}});
                break;
            case "removeAllMarks":
                bg.sendMessageToContentScript({message:{deleteBookmarks:true, isAll: true}});
                break;
            default:
                break;
        }
        window.close();
    }
});