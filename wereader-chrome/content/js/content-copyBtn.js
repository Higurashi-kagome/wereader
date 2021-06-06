// 图片等内容是动态加载的，所以监听 dom 的变化并随时重新生成复制按钮
function copyElObserver(){
    let observer = new MutationObserver(addCopyBtn);
    let target = document.getElementById('renderTargetContent').children[0];
    if(!target){
        window.setTimeout(copyElObserver,500);
        return;
    }
    observer.observe(target, {'childList':true});
}

async function copy(targetText){
    try {
        await navigator.clipboard.writeText(targetText);
        console.log('Copied to clipboard');
    } catch (err) {
        alert('Failed to copy: ', err);
    }
}
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
//给图片添加复制按钮
function addCopyBtn1(){
    let imgs = document.getElementById("renderTargetContent").getElementsByTagName('img');
    for(let i=0;i<imgs.length;i++){
        // 已生成按钮则 continue
        let nextId = $(imgs[i]).next().attr('id');
        if(nextId && nextId.match(/(linkCopy)/)[1]) continue;
        let src = imgs[i].getAttribute("data-src");
        if(!src) return console.error('获取图片链接失败');
        let imgMdText = `![${src.split("/").pop()}](${src})`;
        let [, left, top] = imgs[i].style.transform.match(/translate\(\s*(\d*)px,\s*(\d*)px/);
        let width = imgs[i].style.width.replace('px','');
        let btn =  document.createElement("cl");
        //判断是否为的小图
        // if(imgs[i].style.transform.match(/translate\(\s*(\d*)px,\s*\d*px/)[1] == "0"){
        // }else{
        // }
        setAttributes(btn,
            {id:`linkCopy${i}`,
            textContent:"📋",
            className:"wr_absolute wr_readerImage_opacity",
            style: {cssText: `left:${parseInt(left)+parseInt(width)}px;top:${top}px`}
        });
        $(btn).on('click', function(){
            copy(imgMdText)
            this.textContent = "✔"
            const id = this.id
            setTimeout(function () {
                document.getElementById(id).textContent = "📋"
            }, 1500);
        });
        $(imgs[i]).after(btn);
    }
}

//给注释添加复制按钮
function addCopyBtn2(){
    //获取并遍历注释控件
    const footerNotes = document.getElementsByClassName("reader_footer_note js_readerFooterNote wr_absolute");
    for(let i=0;i<footerNotes.length;i++){
        //获取注释内容、注释按钮位置等信息
        let footernote = footerNotes[i].getAttribute("data-wr-footernote")
        let btn =  document.createElement("cn")
        setAttributes(btn,{
            id:"noteCopy" + i,
            textContent:"📋"
        });
        // 复制按钮点击事件
        btn.addEventListener('click', function(){
            copy(footernote)
            this.textContent = "✔"
            let id = this.id
            setTimeout(function () {
                let element = document.getElementById(id)
                if(element){//处理btn被移除的情况
                    element.textContent = "📋"
                }
            }, 1500);
        }, false);
        // 注释按钮点击事件
        $(footerNotes[i]).on('click', function(){
            const interval = setInterval(() => {
                let p = document.getElementsByClassName("reader_footerNote_text")[0];
                if(!p) return;
                // 避免重复生成
                let nextId = $(p).next().attr('id');
                if(nextId && nextId.match(/(noteCopy)/)[1]) return;
                //处理btn的textContent在点击后未被及时还原的情况
                btn.textContent = "📋"
                $(p).after(btn)
                clearInterval(interval)
            },10)
        })
    }
}

//给代码块添加复制按钮
function addCopyBtn3(){
    let pre = document.getElementsByTagName("pre")
    if(pre.length > 0){
        for(let i=0;i<pre.length;i++){
            let _code = pre[i].textContent;
            let [, left, top] = pre[i].style.transform.match(/translate\(\s*(\d*)px,\s*(\d*)px/);
            let width = pre[i].style.width.replace('px','');
            let btn =  document.createElement("cc");
            setAttributes(btn,{
                id: `codeCopy${i}`,textContent: "📋",
                className: "wr_absolute",
                style: {cssText: `left:${parseInt(left)+parseInt(width)}px;top:${top}px`}
            });
            let nextId = $(pre[i]).next().attr('id');
            if(nextId && nextId.match(/(codeCopy)/)[1]) continue;
            $(btn).on('click', function(){
                this.textContent = "✔"
                const id = this.id
                //每次点击复制按钮都获取一次代码块设置
                chrome.storage.sync.get(["codePre","codeSuf"], function(setting) {
                    let code =  setting.codePre + "\n" + _code + setting.codeSuf
                    copy(code)
                })
                setTimeout(function () {
                    document.getElementById(id).textContent = "📋"
                }, 1500);
            });
            $(pre[i]).after(btn);
        }
    }
}

function addCopyBtn(){
    addCopyBtn1();
    addCopyBtn2();
    addCopyBtn3();
}

//console.log("inject-copyBtn.js：已注入")
// 使用扩展通知来处理切换章节后失效的问题
chrome.runtime.onMessage.addListener(function(msg){
    if(!msg.isCopyBtn) return;
    chrome.storage.sync.get(['enableCopyBtn'], result=>{
        if(result.enableCopyBtn){
            addCopyBtn();
            copyElObserver();
        }
    });
});