
//发送消息给后台复制内容
function setMesToBg(picStr){
    console.log("setMesToBg(picStr)被调用，参数picStr：\n" + picStr)
    console.log("setMesToBg(picStr)开始传递信息给后台")
    chrome.runtime.sendMessage({picText: picStr}, function(response) {
        console.log('setMesToBg(picStr)收到来自后台的回复：' + response);
    });
}

//遍历HTMLCollection生成按钮
function imgshandle(imgs,count){
    console.log("imgshandle(imgs,count)被调用")
    for(var i=0,len=imgs.length;i<len;i++){
        count = count + i
        var src = imgs[i].src
        let picStr = "![" + src.split("/").pop() + "](" + src + ")"
        var top = imgs[i].style.top
        var btn =  document.createElement("a" + count);
        btn.innerHTML = "📋";
        btn.id = "linkCopy" + count
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
            setMesToBg(picStr)
            var id = this.id
            setTimeout(function () {
                document.getElementById(id).innerHTML = "📋"
            }, 1000);
         }, false);
    }
    return count + 1
}

//遍历HTMLCollection检查图片是否加载完毕
function isOver(imgs){
    console.log("isOver(imgs)被调用")
    for(var i=0,len=imgs.length;i<len;i++){
        if(imgs[i].className.indexOf("wr_pendingLoading") != -1){
            return false
        }
    }
    return true
}

//给注释添加复制功能
function addCopyBtn2(){
    console.log("addCopyBtn2()被调用")
    var footerNotes = document.getElementsByClassName("reader_footer_note js_readerFooterNote wr_absolute");
    //遍历注释控件
    for(var i=0,len=footerNotes.length;i<len;i++){
        var footernote = footerNotes[i].getAttribute("data-wr-footernote")
        var top = footerNotes[i].style.top
        var left = footerNotes[i].style.left
        var btn =  document.createElement("n" + i);
        btn.style.left = parseInt(left.substr(0, left.length - 2)) + 60 + "px"
        btn.style.top = parseInt(top.substr(0, top.length - 2)) - 6 + "px"
        btn.style.width = "16px"
        btn.style.cursor = "pointer"
        btn.style.display = "none"
        btn.innerHTML = "📋";
        btn.id = "noteCopy" + i
        btn.className = "wr_absolute wr_readerImage_opacity"
        var parent = footerNotes[i].parentNode
        var inser = parent.insertBefore(btn,footerNotes[i]);
        //给复制按钮注册点击事件
        inser.addEventListener('click', function(){
            this.innerHTML = "✔"
            setMesToBg(footernote)
            var id = this.id
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

//添加复制按钮
function addCopyBtn1(){
    console.log("addCopyBtn1()被调用");
    var imgs1 = document.getElementsByClassName("width90 wr_absolute wr_readerImage_opacity");
    var imgs2 = document.getElementsByClassName("width80 wr_absolute wr_readerImage_opacity");
    var imgs3 = document.getElementsByClassName("qqreader-fullimg wr_absolute wr_readerImage_opacity");
    var imgs4 = document.getElementsByClassName("h-pic wr_absolute wr_readerImage_opacity");
    if(isOver(imgs1) == false||isOver(imgs2) == false||isOver(imgs3) == false||isOver(imgs4) == false){
        alert("为了得到准确的图片，请滚动页面确保所有图片都已加载完毕~");
        return
    }
    var count = imgshandle(imgs1,0);
    count = imgshandle(imgs2,count);
    count = imgshandle(imgs3,count);
    count = imgshandle(imgs4,count);
}

console.log("inject-copy.js已注入")
addCopyBtn1();
addCopyBtn2()
//给body注册点击事件，用于定时隐藏注册复制按钮
document.body.addEventListener('click', function(){
    console.log("document.body.addEventListener()监听到消息并进入了回调函数")
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