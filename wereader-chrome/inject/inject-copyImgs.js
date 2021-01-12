/*用于获取被标注的图片的Markdown文本数组，用于支持导出被标注的图片*/

class Img{
    constructor(alt, src, height, top, isInlineImg){
        this.alt = alt
        this.src = src
        this.height = height
        this.top = top
        this.isInlineImg = isInlineImg
    }
}

class FootNote{
    constructor(name, footnote, height, top){
        this.name = name
        this.height = height
        this.footnote = footnote
        this.top = top
    }
}

class Pre{
    constructor(height, top, code){
        this.height = height
        this.code = code
        this.top = top
    }
}

//发送消息给后台
function setMesToBg(markedData){
    chrome.runtime.sendMessage({type: "markedData", markedData: markedData});
}

//将所有图片、脚注、代码块放到一个数组中
function concatElement(imgAndNoteElems, preElems){
    let objArr = []
    let currentContent = ''
    let notesCounter = 0
    //获取当前目录
    if(document.getElementsByClassName("readerTopBar_title_chapter")[0]){
        currentContent = document.getElementsByClassName("readerTopBar_title_chapter")[0].textContent
    }else{
        currentContent = document.getElementsByClassName("chapterItem chapterItem_current")[0].childNodes[0].childNodes[0].textContent
    }
    for (let i = 0; i < imgAndNoteElems.length; i++) {
        const element = imgAndNoteElems[i];
        let imgSrc = element.getAttribute("data-src");
        let footnote = element.getAttribute("data-wr-footernote");
        let height = parseFloat(element.style.height.replace('px', ''))
        if(imgSrc){
            //判断是否为行内图片
            let isInlineImg = element.className.indexOf('h-pic') > -1;
            let top = parseFloat(element.style.top.replace('px', ''));
            objArr.push(new Img(imgSrc.split("/").pop(),imgSrc,height,top,isInlineImg));
        }else if(footnote){
            //注释图标需要用 2.8 修正
            let top = parseFloat(element.style.top.replace('px', '')) + 2.8;
            objArr.push(new FootNote(`${currentContent}-${notesCounter}`,footnote,height,top));
        }
    }

    for (let i = 0; i < preElems.length; i++) {
        const element = preElems[i];
        let code = element.textContent;
        let padding = parseFloat(window.getComputedStyle(element).paddingTop.replace('px', '')) + 
        parseFloat(window.getComputedStyle(element).paddingBottom.replace('px', ''));
        let height = parseFloat(element.style.height.replace('px', '')) + padding;
        let top = parseFloat(element.style.top.replace('px', ''));
        objArr.push(new Pre(height,top,code));
    }

    objArr.sort(function (x, y) {
        //需要排序的实际上只有代码块，加 5 可防止同行图片被错误排序
        return ((x.top+x.height) > (y.top+y.height+5)) ? 1 : -1
    })
    //console.log(JSON.stringify(objArr))
    return objArr;
}

//获取图片和注释
function getMarkedData(objArr,s0,s1,s2,wr_myNote){
    var markedData = []
    var top = 0, height = 0
    var isInlineImg = false
    var imgSrc = '', footnote = '', code = '', footnoteName = ''
    //根据标注元素与图片/注释在网页中的相对位置来判断图片/注释是否被标注
    function ergodic(markMask){
        for(let j=0;j<markMask.length;j++){
            let divTop = parseFloat(markMask[j].style.top.replace('px', ''))
            let divHeight = parseFloat(markMask[j].style.height.replace('px', ''))
            if(Math.abs(top + height - divTop - divHeight)<=0.1){
                if(imgSrc){
                    markedData.push({alt: imgSrc.split("/").pop(), src: imgSrc, isInlineImg: isInlineImg})
                }else if(footnote){
                    markedData.push({name: footnoteName, footnote: footnote})
                }else if(code){
                    markedData.push({code: code})
                }
                return 1
            }
        }
        return 0
    }
    //遍历 objArr 并逐个检查是否被标注
    for(let i=0;i<objArr.length;i++){
        imgSrc = objArr[i].src
        isInlineImg = objArr[i].isInlineImg
        footnote = objArr[i].footnote
        footnoteName = objArr[i].name
        code = objArr[i].code
        height = objArr[i].height
        top = objArr[i].top
        //遍历各级别标注
        ergodic(s0) || ergodic(s1) || ergodic(s2) || ergodic(wr_myNote)
    }
    return markedData
}

//入口
function main(setting){
    //获取正文所有图片和注释 Element
    var imgAndNoteTags = document.querySelectorAll(".wr_readerImage_opacity,.reader_footer_note.js_readerFooterNote.wr_absolute");
    var preElems = document.getElementsByTagName('pre');
    var objArr = concatElement(imgAndNoteTags, preElems)
    //获取三种标注 Element
    var s0 = document.getElementsByClassName("wr_underline s0");
    var s1 = document.getElementsByClassName("wr_underline s1");
    var s2 = document.getElementsByClassName("wr_underline s2");
    var wr_myNote = []
    if(setting.addThoughts){
        //TODO
        /* let marks = []
        let item_title = document.getElementsByClassName('sectionListItem_title');
        for (let i = 0; i < item_title.length; i++) {
            const element = item_title[i];
            if(element.textContent == currentContent){
                var parentNode = element.parentNode
            }
        }
        while(true){
            //获取被标注内容（包括添加了想法的内容）
            let markText = parentNode.getElementsByClassName('text')[0].textContent;
            marks.push(markText);
            parentNode = parentNode.nextElementSibling;
            //不存在标注或抵达下一章则结束
            if(parentNode == null || parentNode.getElementsByClassName('sectionListItem_title')[0])break;
            // let abstract = parentNode.getElementsByClassName('abstract')[0]
            // let abstractText = abstract?abstract.textContent:undefined
        }
        //获取'[插图]'个数
        let count = 0
        for (let i = 0; i < marks.length; i++) {
            const text = marks[i];
            if(text.indexOf('[插图]')>-1)count++;
        } */
        //获取想法标注元素
        //wr_myNote = document.getElementsByClassName("wr_myNote");
        //如果想法标注个数小于'[插图]'个数
        /* if(wr_myNote.length<count){} */
    }
    let markedData = getMarkedData(objArr,s0,s1,s2,wr_myNote);
    setMesToBg(markedData)
}

//console.log("inject-copyImgs.js：被注入")
chrome.storage.sync.get(function(setting){
    main(setting)
})