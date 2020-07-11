/*给页面中的图片和注释添加复制按钮，并为复制按钮绑定点击事件，与background.js配合实现点击后复制图片Markdown*/
//发送消息给后台复制内容
function sendMsgToBg(picStr){
    console.log("sendMsgToBg(picStr)：被调用，参数picStr：\n" + picStr)
    console.log("sendMsgToBg(picStr)开始传递信息给后台")
    chrome.runtime.sendMessage({picText: picStr});
}

//为图片遍历HTMLCollection生成按钮
function generateBtn(imgs){
    console.log("generateBtn(imgs)：被调用")
    for(var i=0,len=imgs.length;i<len;i++){
        var src = imgs[i].getAttribute("data-src")
        if(src == null || src == ""){
            console.log("inject-copyBtn.js => addCopyBtn1() => generateBtn(imgs)：图片链接获取失败")
            alert("inject-copyBtn.js => addCopyBtn1() => generateBtn(imgs)：图片链接获取失败。\n建议提交反馈到：https://github.com/liuhao326/wereader")
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
            }, 1000);
         }, false);
    }
}

//给图片添加复制按钮
function addCopyBtn1(){
    console.log("addCopyBtn1()：被调用");
    var imgs = document.getElementById("renderTargetContent").getElementsByTagName("img");
    /* if(isOver(imgs) == false){
        alert("为了得到准确的图片，请滚动页面确保所有图片都已加载完毕~");
        return
    } */
    generateBtn(imgs);
}

console.log("inject-copyBtn.js：\ninject-copyBtn.js已注入")
if(document.getElementById("linkCopy0") == undefined){
    addCopyBtn1();
}

//给注释添加复制功能
/*
function addCopyBtn2(){
    console.log("addCopyBtn2()：被调用")
    var footerNotes = document.getElementsByClassName("reader_footer_note js_readerFooterNote wr_absolute");
    //遍历注释控件
    for(var i=0,len=footerNotes.length;i<len;i++){
        //获取注释内容、注释按钮位置等信息
        let footernote = footerNotes[i].getAttribute("data-wr-footernote")
        let top = footerNotes[i].style.top
        let left = footerNotes[i].style.left
        //创建复制按钮并嵌入到注释控件位置之前
        let btn =  document.createElement("n" + i);
        btn.style.left = parseInt(left.substr(0, left.length - 2)) + 60 + "px"
        btn.style.top = parseInt(top.substr(0, top.length - 2)) - 6 + "px"
        btn.style.width = "16px"
        btn.style.cursor = "pointer"
        btn.style.display = "none"
        btn.innerHTML = "📋";
        btn.id = "noteCopy" + i
        btn.className = "wr_absolute wr_readerImage_opacity"
        let parent = footerNotes[i].parentNode
        let inser = parent.insertBefore(btn,footerNotes[i])
        //给复制按钮注册点击事件
        inser.addEventListener('click', function(){
            this.innerHTML = "✔"
            sendMsgToBg(footernote)
            let id = this.id
            //控件被点击后一秒消失
            setTimeout(function () {
                document.getElementById(id).style.display = "none"
                document.getElementById(id).innerHTML = "📋"
            }, 1000);
         }, false);
         //给注释按钮注册点击事件：点击后复制按钮变为可见
         footerNotes[i].addEventListener('click', function(){
            btn.style.display = "block"
        },false)
    }
}
*/

//注释复制按钮直接content.js生成，故舍弃不用
/* if(document.getElementById("noteCopy0") == undefined){
    addCopyBtn2()
    //给body注册点击事件，用于定时隐藏注释复制按钮
    document.body.addEventListener('click', function(){
        console.log("inject-copyBtn.js:\ndocument.body.addEventListener()监听到消息开始计时")
        setTimeout(function () {
            if(document.getElementsByClassName("reader_footerNote_mask").length == 0){
                var nodes = document.getElementsByClassName("wr_absolute wr_readerImage_opacity")
                for(var i=0,len=nodes.length;i<len;i++){
                    if(nodes[i].id.substr(0,8) == "noteCopy"){
                        if(nodes[i].innerHTML != "✔"){
                            nodes[i].style.display = "none"
                        }
                    }
                }
            }
        }, 2500);
    },false)
} */

//遍历HTMLCollection检查图片是否加载完毕
/*舍弃*/
/* function isOver(imgs){
    console.log("isOver(imgs)：被调用")
    for(var i=0,len=imgs.length;i<len;i++){
        if(imgs[i].className.indexOf("wr_pendingLoading") != -1){
            return false
        }
    }
    return true
} */