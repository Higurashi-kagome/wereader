/*用于获取被标注的图片的Markdown文本数组，用于支持导出被标注的图片*/

//发送消息给后台
function setMesToBg(imgsArray){
    chrome.runtime.sendMessage({type: "imgsArr", RimgsArr: imgsArray});
}

//获取imgs数组
function requestImgsArray(imgAndnoteTags,s0,s1,s2){
    let imgsArray = []
    let notesCounter = 0
    var top = 0, height = 0
    var imgSrc = '', footnote = ''
    var currentContent = ''
    if(document.getElementsByClassName("readerTopBar_title_chapter")[0]){
        currentContent = document.getElementsByClassName("readerTopBar_title_chapter")[0].textContent
    }else{
        currentContent = document.getElementsByClassName("chapterItem chapterItem_current")[0].childNodes[0].childNodes[0].textContent
    }
    //遍历标注元素更新 imgArray，根据标注元素与图片/注释在网站中的位置来判断图片/注释是否被标注
    function ergodic(markMask, isImg){
        for(let j=0,len2=markMask.length;j<len2;j++){
            let topDiv = parseFloat(markMask[j].style.top.replace('px', ''))
            let heightDiv = parseFloat(markMask[j].style.height.replace('px', ''))
            console.log(top + height - topDiv - heightDiv)
            if(Math.abs(top + height - topDiv - heightDiv)<=0.1){
                if(isImg){
                    imgsArray.push({alt: imgSrc.split("/").pop(), src: imgSrc})
                }else{
                    imgsArray.push({name: `${currentContent}-${notesCounter}`, footnote: footnote})
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
            top = parseFloat(imgAndnoteTags[i].style.top.replace('px', ''))
        }else{
            top = parseFloat(imgAndnoteTags[i].style.top.replace('px', '')) + 2.8
        }
        //遍历各级别标注
        if(!ergodic(s0, imgSrc))
            if(!ergodic(s1, imgSrc))
                ergodic(s2, imgSrc)
    }
    console.log(imgsArray)
    return imgsArray
}

//入口
function main(){
    //获取正文所有图片
    var imgAndnoteTags = document.querySelectorAll(".wr_readerImage_opacity,.reader_footer_note.js_readerFooterNote.wr_absolute");
    var s0 = document.getElementsByClassName("wr_underline s0");
    var s1 = document.getElementsByClassName("wr_underline s1");
    var s2 = document.getElementsByClassName("wr_underline s2");
    var imgsArray = requestImgsArray(imgAndnoteTags,s0,s1,s2);
    setMesToBg(imgsArray)
}

//console.log("inject-copyImgs.js：被注入")
main()