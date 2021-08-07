/*用于获取被标注的图片的 Markdown 文本数组，用于支持导出被标注的图片*/
// todo
//将所有图片、脚注、代码块放到一个数组中
(async (window)=>{
    function getElObj(){
        let targetEls = 
            document.querySelectorAll("img.wr_readerImage_opacity,.reader_footer_note.js_readerFooterNote.wr_absolute,pre");
        let elObjArr = [], currentChapTitle = window.getCurrentChapTitle();
        //处理图片和注释
        targetEls.forEach(el=>{
            let imgSrc = el.getAttribute("data-src");
            let footnote = el.getAttribute("data-wr-footernote");
            let height = parseFloat(el.style.height.replace('px', ''));
            let top = parseFloat(el.style.transform.match(/translate\(\s*(\d*)px,\s*(\d*)px/)[2]);
            if(imgSrc){
                //判断是否为行内图片
                let isInlineImg = el.className.indexOf('h-pic') > -1;
                let alt = imgSrc.split("/").pop();
                elObjArr.push({alt: alt, imgSrc: imgSrc, height: height, top: top, isInlineImg: isInlineImg});
            }else if(footnote){
                elObjArr.push({currentChapTitle: currentChapTitle, footnote: footnote, height: height, top: top});
            }else{//代码块
                let code = el.textContent;
                let padding = parseFloat(window.getComputedStyle(el).paddingTop.replace('px', '')) + 
                    parseFloat(window.getComputedStyle(el).paddingBottom.replace('px', ''));
                height = height + padding;
                elObjArr.push({height: height, top: top, code: code});
            }
        });
        return elObjArr;
    };
    // 点击所有包含“[插图]”的标注，使相关数据加载出来，能够被getElObj()获取到
    async function scrollTo() {
        const originScrollTop = document.documentElement.scrollTop;
        const currentChapTitle = window.getCurrentChapTitle();
        let sectionListItems = document.getElementsByClassName('sectionListItem');
        let tag = false;
        async function action(text,element) {
            if(text && text[0].textContent.indexOf('[插图]')>=0){
                element.querySelector('.sectionListItem_content.noteItem_content.clickable').click();
            }
        }
        for (let i = 0; i < sectionListItems.length; i++) {
            const element = sectionListItems[i];
            let sectionListItem_title = element.getElementsByClassName('sectionListItem_title')[0];
            let text = element.getElementsByClassName('text');
            if(sectionListItem_title && sectionListItem_title.textContent == currentChapTitle){
                tag = true;
                await action(text,element);
            }else if(tag == true 
                && sectionListItem_title 
                && sectionListItem_title.textContent != currentChapTitle){
                break;
            }else if(tag == true){
                await action(text,element);
            }
        }
        // 返回原位置的值，直接在函数中跳转似乎会存在获取数据失败的问题，所以先返回并 sleep 再跳转
        return originScrollTop;
        
    };
    //获取图片和注释
    async function getMarkedData(addThoughts){
        const originScrollTop = await scrollTo();
        await window.sleep(100);
        window.scrollTo(0,originScrollTop);
        const elObjArr = getElObj();
        //获取三种标注 Element
        let selector = '.wr_underline.s0,.wr_underline.s1,.wr_underline.s2';
        //获取想法标注 Element
        if(addThoughts) selector = `${selector},.wr_myNote`;
        const markMasks = document.querySelectorAll(selector);
        
        let markedData = [], notesCounter = 1;
        //遍历 objArr 并逐个检查是否被标注
        elObjArr.forEach(obj=>{
            let {imgSrc,alt,isInlineImg,footnote,currentChapTitle,code,height,top} = obj;
            //根据标注元素与图片/注释在网页中的相对位置来判断图片/注释是否被标注
            for (let i = 0; i < markMasks.length; i++) {
                const mask = markMasks[i];
                let maskTop = parseFloat(mask.style.top.replace('px', ''));
                let maskHeight = parseFloat(mask.style.height.replace('px', ''));
                // 脚注需要另外判断是否被标注
                if(!footnote && Math.abs(top + height - maskTop - maskHeight)>0.1) {
                    // console.log(obj,maskTop,maskHeight,top + height - maskTop - maskHeight);
                    continue;
                }
                if(footnote && (top < maskTop || (maskTop + maskHeight) < (top + height))) {
                    // console.log(obj,maskTop,maskHeight,top + height - maskTop - maskHeight);
                    continue;
                }
                if(imgSrc){
                    markedData.push({alt: alt, src: imgSrc, isInlineImg: isInlineImg})
                }else if(footnote){
                    markedData.push({name: `${currentChapTitle} 注${notesCounter++}`, footnote: footnote})
                }else if(code){
                    markedData.push({code: code})
                }
                break;
            }
        });
        return markedData;
    };
    // console.log("content-markedData.js：被注入")
    chrome.runtime.onMessage.addListener((request, sender, sendResponse)=>{
        if(!request.isGetMarkedData) return;
        getMarkedData(request.addThoughts).then(markedData=>{
            sendResponse(markedData);
        });
        // 存在异步问题，必须返回 true
        return true;
    });
})(window);