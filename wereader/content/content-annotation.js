console.log("content-copyAnnotation.js：被注入")
//发送消息给后台复制内容
function sendMsgToBg(picStr){
    console.log("sendMsgToBg(picStr)：被调用，参数picStr：\n" + picStr)
    console.log("sendMsgToBg(picStr)开始传递信息给后台")
    chrome.runtime.sendMessage({picText: picStr});
}
window.onload = function(){
    setTimeout(() => {
        var footerNotes = document.getElementsByClassName("reader_footer_note js_readerFooterNote wr_absolute");
        //遍历注释控件
        for(var i=0,len=footerNotes.length;i<len;i++){
            console.log("for => i = " + i)
            //获取注释内容、注释按钮位置等信息
            let footernote = footerNotes[i].getAttribute("data-wr-footernote")
            let btn =  document.createElement("a0")
            btn.style.width = "19px"
            btn.style.height = "19px"
            btn.style.cursor = "pointer"
            btn.style.display = "block"
            btn.style.fontSize = "19px"
            btn.innerHTML = "📋"
            btn.id = "noteCopy" + i
            btn.addEventListener('click', function(){
                sendMsgToBg(footernote)
                this.innerHTML = "✔"
                let id = this.id
                //控件被点击后一秒
                setTimeout(function () {
                    document.getElementById(id).innerHTML = "📋"
                }, 1000);
            }, false);
            //btn.className = "wr_absolute wr_readerImage_opacity"
            //给注释按钮注册点击事件
            footerNotes[i].addEventListener('click', function(){
                var interval = setInterval(() => {
                    let p = document.getElementsByClassName("reader_footerNote_text")[0]
                    if(p != undefined){
                        console.log("setInterval() => p != undefined")
                        let parent = p.parentNode
                        parent.appendChild(btn)
                        //结束定时器
                        clearInterval(interval)
                    }else{
                        console.log("setInterval() => p == undefined，重新获取")
                    }
                },10)
            },false)
        }
    }, 1000);
}
