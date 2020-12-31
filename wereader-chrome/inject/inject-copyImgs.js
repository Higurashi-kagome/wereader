/*用于获取被标注的图片的Markdown文本数组，用于支持导出被标注的图片*/

//发送消息给后台
function setMesToBg(imgsAndNotes){
    chrome.runtime.sendMessage({type: "imgsAndNotes", imgsAndNotes: imgsAndNotes});
}

//获取图片和注释
function requestImgNotes(imgAndnoteTags,s0,s1,s2){
    let imgsAndNotes = []
    let notesCounter = 0
    var top = 0, height = 0
    var isInlineImg = false
    var imgSrc = '', footnote = ''
    var currentContent = ''
    if(document.getElementsByClassName("readerTopBar_title_chapter")[0]){
        currentContent = document.getElementsByClassName("readerTopBar_title_chapter")[0].textContent
    }else{
        currentContent = document.getElementsByClassName("chapterItem chapterItem_current")[0].childNodes[0].childNodes[0].textContent
    }
    //遍历标注元素更新 imgsAndNotes，根据标注元素与图片/注释在网站中的位置来判断图片/注释是否被标注
    function ergodic(markMask){
        for(let j=0,len2=markMask.length;j<len2;j++){
            let divTop = parseFloat(markMask[j].style.top.replace('px', ''))
            let divHeight = parseFloat(markMask[j].style.height.replace('px', ''))
            console.log(top + height - divTop - divHeight)
            if(Math.abs(top + height - divTop - divHeight)<=0.1){
                if(imgSrc){
                    imgsAndNotes.push({alt: imgSrc.split("/").pop(), src: imgSrc, isInlineImg: isInlineImg})
                }else{
                    imgsAndNotes.push({name: `${currentContent}-${notesCounter}`, footnote: footnote})
                    notesCounter++
                }
                return 1
            }
        }
        return 0
    }
    for(let i=0,len=imgAndnoteTags.length;i<len;i++){
        imgSrc = imgAndnoteTags[i].getAttribute("data-src")
        footnote = imgAndnoteTags[i].getAttribute("data-wr-footernote")
        height = parseFloat(imgAndnoteTags[i].style.height.replace('px', ''))
        //注释图标的位置需要修正
        if(imgSrc){
            isInlineImg = imgAndnoteTags[i].className.indexOf('h-pic') > -1
            top = parseFloat(imgAndnoteTags[i].style.top.replace('px', ''))
        }else{
            top = parseFloat(imgAndnoteTags[i].style.top.replace('px', '')) + 2.8
        }
        //遍历各级别标注
        if(!ergodic(s0))
            if(!ergodic(s1))
                ergodic(s2)
    }
    return imgsAndNotes
}

//入口
function main(){
    //获取正文所有图片
    var imgAndnoteTags = document.querySelectorAll(".wr_readerImage_opacity,.reader_footer_note.js_readerFooterNote.wr_absolute");
    var s0 = document.getElementsByClassName("wr_underline s0");
    var s1 = document.getElementsByClassName("wr_underline s1");
    var s2 = document.getElementsByClassName("wr_underline s2");
    var imgsAndNotes = requestImgNotes(imgAndnoteTags,s0,s1,s2);
    setMesToBg(imgsAndNotes)
}

//console.log("inject-copyImgs.js：被注入")
main()