/*用于获取被标注的图片的 Markdown 文本数组，用于支持导出被标注的图片等内容*/
(async (window)=>{
	// 将所有图片、脚注、代码块放到一个数组中
    function getElObj(){
        let elObjArr = [], currentChapTitle = window.getCurrentChapTitle();
        //处理图片和注释
        $("img.wr_readerImage_opacity,.reader_footer_note.js_readerFooterNote.wr_absolute,pre").each((idx, el)=>{
            let imgSrc = el.getAttribute("data-src");
            let footnote = el.getAttribute("data-wr-footernote");
            let height = parseFloat(el.style.height.replace('px', ''));
            let top = parseFloat(el.style.transform.match(/translate\(\s*(\d*)px,\s*(\d*)px/)[2]);
            if(imgSrc){
                //判断是否为行内图片
                const isInlineImg = el.className.indexOf('h-pic') > -1;
                const alt = imgSrc.split("/").pop();
                elObjArr.push({alt: alt, imgSrc: imgSrc, height: height, top: top, isInlineImg: isInlineImg});
            }else if(footnote){
                elObjArr.push({currentChapTitle: currentChapTitle, footnote: footnote, height: height, top: top});
            }else{//代码块
                const code = el.textContent;
                const padding = parseFloat(window.getComputedStyle(el).paddingTop.replace('px', '')) + 
                    parseFloat(window.getComputedStyle(el).paddingBottom.replace('px', ''));
                height = height + padding;
                elObjArr.push({height: height, top: top, code: code});
            }
        });
        return elObjArr;
    };
    // 点击所有包含“[插图]”的标注，使相关数据加载出来，能够被 getElObj() 获取到
    async function scrollTo() {
        const originScrollTop = document.documentElement.scrollTop;
        const currentChapTitle = window.getCurrentChapTitle();
		// 所有标注，包括想法、标题
        let sectionListItems = document.getElementsByClassName('sectionListItem');
		// 确定是否为当前章节的标注
        let foundChap = false;
		// 点击标注
        async function action(element) {
			let el = $(element);
			let clickable = el.find('.sectionListItem_content.noteItem_content.clickable');
			// 标注/想法内容
			let text = el.find('.text');
			// 想法对应文字
			let abstract = el.find('.abstract');
			if (abstract.length) {
				// 先判断是否为想法，并处理
				if (abstract.text().indexOf('[插图]')>=0)
					clickable.click();
			} else if(text.length && text.text().indexOf('[插图]')>=0){
				// 处理标注
				clickable.click();
			}
        }
		// 遍历所有标注
        for (let i = 0; i < sectionListItems.length; i++) {
            const element = sectionListItems[i];
			// 标题
            let sectionListItem_title = element.getElementsByClassName('sectionListItem_title')[0];
			
            if(sectionListItem_title && sectionListItem_title.textContent == currentChapTitle){
                foundChap = true;
                await action(element);
            }else if(foundChap == true 
                && sectionListItem_title 
                && sectionListItem_title.textContent != currentChapTitle){
					// 不再属于当前章节，退出循环
                break;
            }else if(foundChap == true){
                await action(element);
            }
        }
        // 返回原位置的值，直接在函数中跳转/隐藏面板似乎会失败，所以先返回并 sleep 再处理
        return originScrollTop;
    };
    // 获取图片和注释
    async function getMarkedData(addThoughts){
        const originScrollTop = await scrollTo();
        await window.sleep(100);
		// 关闭想法浏览面板和标注面板
		let thoughtReview = $('#readerReviewDetailPanel');
		let reader_toolbar = $('.reader_toolbar_container');
		if (thoughtReview.length && thoughtReview.parent().css('display') !== 'none')$('body').click();
		if (reader_toolbar.length && reader_toolbar.css('display') !== 'none') reader_toolbar.remove();
		// 回到原位置
        window.scrollTo(0,originScrollTop);
        const elObjArr = getElObj();
        // 三种标注线
        let selector = '.wr_underline.s0,.wr_underline.s1,.wr_underline.s2';
        // 获取想法时加上想法标注线
        if(addThoughts) selector = `${selector},.wr_myNote`;
        const markMasks = document.querySelectorAll(selector);
        
        let markedData = [], notesCounter = 1;
        //遍历 objArr 并逐个检查是否被标注
        elObjArr.forEach(obj=>{
            let {imgSrc,alt,isInlineImg,footnote,currentChapTitle,code,height,top} = obj;
            // 根据 mask 与 obj 在网页中的相对位置来判断 obj 是否被标注
            for (let i = 0; i < markMasks.length; i++) {
                const mask = markMasks[i];
                let maskTop = parseFloat(mask.style.top.replace('px', ''));
                let maskHeight = parseFloat(mask.style.height.replace('px', ''));
                // 不是脚注（图片/代码块），但没被标注，则继续
                if(!footnote && Math.abs(top + height - maskTop - maskHeight) > 0.1) continue;
				// 是脚注，但没被标注，则继续
                if(footnote && (top < maskTop || (maskTop + maskHeight) < (top + height))) continue;
                if(imgSrc){
                    markedData.push({alt: alt, imgSrc: imgSrc, isInlineImg: isInlineImg})
                }else if(footnote){
                    markedData.push({footnoteName: `${currentChapTitle}-注${notesCounter++}`, footnote: footnote})
                }else if(code){
                    markedData.push({code: code})
                }
				// 确认 obj 被标注时结束 for 循环，继续判断下一个 obj 是否被标注
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