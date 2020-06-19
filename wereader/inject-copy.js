
//发送消息给后台复制内容
function setMesToBg(picStr){
    console.log("setMesToBg(picStr)被调用，参数picStr：\n" + picStr)
    console.log("setMesToBg(picStr)开始传递信息给后台")
    chrome.runtime.sendMessage({picText: picStr}, function(response) {
        console.log('setMesToBg(picStr)收到来自后台的回复：' + response);
    });
}

//添加复制按钮
function addCopyBtn(){
    console.log("addCopyBtn()被调用");
    var imgs = document.getElementsByClassName("width90 wr_absolute wr_readerImage_opacity");
    console.log("imgs.length:\n" + imgs.length);
    for(var i=0,len=imgs.length;i<len;i++){
        if(imgs[i].className == "width90 wr_absolute wr_readerImage_opacity wr_pendingLoading"){
            alert("为了得到准确的图片，请滚动页面确保所有图片都已加载完毕~");
            return
        }
    }
    for(var i=0,len=imgs.length;i<len;i++){
        /* if(imgs[i].className.substr(0,5) != "width"){
            console.log("特殊className")
            continue
        } */
        var src = imgs[i].src
        let picStr = "![" + src.split("/").pop() + "](" + src + ")"
        var top = imgs[i].style.top
        var btn =  document.createElement("a" + i);
        btn.innerHTML = "📋";
        btn.id = "linkCopy" + i
        btn.className = "wr_absolute wr_readerImage_opacity"
        //btn.style.cssText = "border-radius: 3px;background-color: rgb(227,227,227);"
        btn.style.top = parseInt(top.substr(0, top.length - 2)) - 20 + "px"
        btn.style.right = "0px"
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
    
}

console.log("inject-copy.js已注入")
addCopyBtn();