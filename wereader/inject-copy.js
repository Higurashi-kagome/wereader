
//发送消息给后台复制内容
function setMesToBg(picStr){
    console.log("setMesToBg(picStr)被调用，参数picStr：\n" + picStr)
    console.log("setMesToBg(picStr)开始传递信息给后台")
    chrome.runtime.sendMessage({picText: picStr}, function(response) {
        console.log('setMesToBg(picStr)收到来自后台的回复：' + response);
    });
}

//遍历HTMLCollection
function imgshandle(imgs,count){
    for(var i=0,len=imgs.length;i<len;i++){
        if(imgs[i].className == "width90 wr_absolute wr_readerImage_opacity wr_pendingLoading"){
            alert("为了得到准确的图片，请滚动页面确保所有图片都已加载完毕~");
            return
        }
    }
    for(count,C=count,len=count + imgs.length;count<len;count++){
        /* if(imgs[i].className.substr(0,5) != "width"){
            console.log("特殊className")
            continue
        } */
        var src = imgs[count-C].src
        let picStr = "![" + src.split("/").pop() + "](" + src + ")"
        var top = imgs[count-C].style.top
        var btn =  document.createElement("a" + count);
        btn.innerHTML = "📋";
        btn.id = "linkCopy" + count
        btn.className = "wr_absolute wr_readerImage_opacity"
        //btn.style.cssText = "border-radius: 3px;background-color: rgb(227,227,227);"
        btn.style.top = parseInt(top.substr(0, top.length - 2)) - 20 + "px"
        btn.style.right = "0px"
        btn.style.width = "16px"
        btn.style.cursor = "pointer"
        var parent = imgs[count-C].parentNode
        var inser = parent.insertBefore(btn,imgs[count-C]);
        inser.addEventListener('click', function(){
            this.innerHTML = "✔"
            setMesToBg(picStr)
            var id = this.id
            setTimeout(function () {
                document.getElementById(id).innerHTML = "📋"
            }, 1000);
         }, false);
    }
    return count
}

//添加复制按钮
function addCopyBtn(){
    console.log("addCopyBtn()被调用");
    var imgs1 = document.getElementsByClassName("width90 wr_absolute wr_readerImage_opacity");
    var imgs2 = document.getElementsByClassName("width80 wr_absolute wr_readerImage_opacity");
    var count = imgshandle(imgs1,0);
    imgshandle(imgs2,count);
}

console.log("inject-copy.js已注入")
addCopyBtn();