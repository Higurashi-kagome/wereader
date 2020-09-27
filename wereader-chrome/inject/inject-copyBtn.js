/*用于给页面中的图片和注释添加复制按钮，并为复制按钮绑定点击事件，与background.js配合实现点击后复制图片Markdown*/

//发送消息给后台复制内容
function sendMsgToBg(picStr){
    chrome.runtime.sendMessage({type: "copyImg", picText: picStr});
}

//为图片遍历HTMLCollection生成按钮
function generateBtn(imgs){
    for(var i=0,len=imgs.length;i<len;i++){
        var src = imgs[i].getAttribute("data-src")
        if(src == null || src == ""){
            Swal.fire({title: "Oops...",html: "generateBtn(imgs)：<br>图片链接获取失败。",icon: "error",confirmButtonText: '确定'})
            return
        }
        let picStr = "![" + src.split("/").pop() + "](" + src + ")"
        var top = imgs[i].style.top
        var btn =  document.createElement("a" + i);
        btn.innerHTML = "📋";
        btn.id = "linkCopy" + i
        btn.className = "wr_absolute wr_readerImage_opacity"
        //判断是否为style.left == "0px"的小图
        if(imgs[i].style.left == "0px"){
            btn.style.left = "0px"
            btn.style.top = parseInt(top.substr(0, top.length - 2)) - 30 + "px"
        }else{
            btn.style.right = "0px"
            btn.style.top = parseInt(top.substr(0, top.length - 2)) - 20 + "px"
        }
        btn.style.width = "16px"
        btn.style.cursor = "pointer"
        var parent = imgs[i].parentNode
        var inser = parent.insertBefore(btn,imgs[i]);
        inser.addEventListener('click', function(){
            this.innerHTML = "✔"
            sendMsgToBg(picStr)
            var id = this.id
            setTimeout(function () {
                document.getElementById(id).innerHTML = "📋"
            }, 1500);
         }, false);
    }
}

//给图片添加复制按钮
function addCopyBtn1(){
    var imgs = document.getElementById("renderTargetContent").getElementsByTagName("img");
    generateBtn(imgs);
}

//给注释添加复制按钮
function addCopyBtn2(){
    var footerNotes = document.getElementsByClassName("reader_footer_note js_readerFooterNote wr_absolute");
    //遍历注释控件
    for(var i=0,len=footerNotes.length;i<len;i++){
        //获取注释内容、注释按钮位置等信息
        let footernote = footerNotes[i].getAttribute("data-wr-footernote")
        let btn =  document.createElement("a0")
        btn.style.cssText = "width:19px;height:19px;cursor:pointer;display:block;font-size:19px"
        btn.innerHTML = "📋"
        btn.id = "noteCopy" + i
        btn.addEventListener('click', function(){
            sendMsgToBg(footernote)
            this.innerHTML = "✔"
        }, false);
        btn.onmouseleave = function(){
            this.innerHTML = "📋"
        }
        //btn.className = "wr_absolute wr_readerImage_opacity"
        //给注释按钮注册点击事件
        footerNotes[i].addEventListener('click', function(){
            var interval = setInterval(() => {
                let p = document.getElementsByClassName("reader_footerNote_text")[0]
                if(p != undefined){
                    let parent = p.parentNode
                    parent.appendChild(btn)
                    //结束定时器
                    clearInterval(interval)
                }
            },10)
        },false)
    }
}

//给代码块添加复制按钮
function addCopyBtn3(){
    var pre = document.getElementsByTagName("pre")
    if(pre.length > 0){
        for(var i=0,len=pre.length;i<len;i++){
            let _code = pre[i].innerHTML
            let top = pre[i].style.top
            var btn =  document.createElement("b" + i);
            btn.innerHTML = "📋";
            btn.id = "codeCopy" + i
            btn.className = "wr_absolute"
            btn.style.cssText = "right:0px;width:16px;height:32px;cursor:pointer"
            btn.style.top = parseInt(top.substr(0, top.length - 2)) - 32 + "px"
            let parent = pre[i].parentNode
            let inser = parent.insertBefore(btn,pre[i]);
            inser.addEventListener('click', function(){
                this.innerHTML = "✔"
                var id = this.id
                //每次点击复制按钮都获取一次"代码块语言 "
                keys = ["preLang","codePre","codeSuf"]
                chrome.storage.sync.get(keys, function(setting) {
                    for(var i=0,len=keys.length;i<len;i++){
                        key = keys[i]
                        if(setting[key] == undefined){
                            setting[key] = (key == "preLang") ? "" : "```"
                        }
                    }
                    code =  setting.codePre + setting.preLang + "\n" + _code + setting.codeSuf
                    sendMsgToBg(code)
                })
                setTimeout(function () {
                    document.getElementById(id).innerHTML = "📋"
                }, 1500);
            }, false);
        }
    }
}

//console.log("inject-copyBtn.js：已注入")
if(document.getElementById("linkCopy0") == undefined){
    addCopyBtn1()
    addCopyBtn2()
    addCopyBtn3()
}