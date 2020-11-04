/*用于给页面中的图片和注释添加复制按钮，并为复制按钮绑定点击事件，与background.js配合实现点击后复制图片Markdown*/

//发送消息给后台复制内容
function sendMsgToBg(picStr){
    chrome.runtime.sendMessage({type: "copyImg", picText: picStr});
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
    let imgs = document.getElementById("renderTargetContent").getElementsByTagName("img");
    for(var i=0,len=imgs.length;i<len;i++){
        var src = imgs[i].getAttribute("data-src")
        if(!src){
            Swal.fire({title: "Oops...",html: "图片链接获取失败。",icon: "error",confirmButtonText: '确定'})
            return
        }
        let picStr = "![" + src.split("/").pop() + "](" + src + ")"
        var top = imgs[i].style.top
        var btn =  document.createElement("a" + i);
        //判断是否为style.left == "0px"的小图
        if(imgs[i].style.left == "0px"){
            btn.style.left = "0px"
            btn.style.top = parseInt(top.substr(0, top.length - 2)) - 30 + "px"
        }else{
            btn.style.right = "0px"
            btn.style.top = parseInt(top.substr(0, top.length - 2)) - 20 + "px"
        }
        setAttributes(btn,{id:"linkCopy" + i,textContent:"📋",className:"wr_absolute wr_readerImage_opacity",style:{zIndex:4,width:"16px",cursor:"pointer"}})
        var parent = imgs[i].parentNode
        var inser = parent.insertBefore(btn,imgs[i]);
        inser.addEventListener('click', function(){
            sendMsgToBg(picStr)
            this.textContent = "✔"
            var id = this.id
            setTimeout(function () {
                document.getElementById(id).textContent = "📋"
            }, 1500);
         }, false);
    }
}

//给注释添加复制按钮
function addCopyBtn2(){
    var footerNotes = document.getElementsByClassName("reader_footer_note js_readerFooterNote wr_absolute");
    //遍历注释控件
    for(var i=0,len=footerNotes.length;i<len;i++){
        //获取注释内容、注释按钮位置等信息
        let footernote = footerNotes[i].getAttribute("data-wr-footernote")
        let btn =  document.createElement("a0")
        setAttributes(btn,{id:"noteCopy" + i,textContent:"📋",style:{cssText:"width:19px;height:19px;cursor:pointer;display:block;font-size:19px;z-index:4;"}})
        btn.addEventListener('click', function(){
            sendMsgToBg(footernote)
            this.textContent = "✔"
            var id = this.id
            setTimeout(function () {
                let element = document.getElementById(id)
                if(element){//处理btn被移除的情况
                    element.textContent = "📋"
                }
            }, 1500);
         }, false);
        //给注释按钮注册点击事件
        footerNotes[i].addEventListener('click', function(){
            var interval = setInterval(() => {
                let p = document.getElementsByClassName("reader_footerNote_text")[0]
                if(p){
                    btn.textContent = "📋"//处理btn的textContent在点击后未被及时还原的情况
                    p.parentNode.appendChild(btn)
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
            let btn =  document.createElement("b" + i);
            setAttributes(btn,{id:"codeCopy" + i,textContent:"📋",className:"wr_absolute",style:{cssText:"right:0px;width:16px;height:32px;cursor:pointer;z-index:4;"}})
            btn.style.top = parseInt(top.substr(0, top.length - 2)) - 32 + "px"
            let inser = pre[i].parentNode.insertBefore(btn,pre[i]);
            inser.addEventListener('click', function(){
                this.textContent = "✔"
                var id = this.id
                //每次点击复制按钮都获取一次代码块设置
                chrome.storage.sync.get(["codePre","codeSuf"], function(setting) {
                    let code =  setting.codePre + "\n" + _code + setting.codeSuf
                    sendMsgToBg(code)
                })
                setTimeout(function () {
                    document.getElementById(id).textContent = "📋"
                }, 1500);
            }, false);
        }
    }
}

//console.log("inject-copyBtn.js：已注入")
if(!document.getElementById("linkCopy0")){
    addCopyBtn1()
    addCopyBtn2()
    addCopyBtn3()
}