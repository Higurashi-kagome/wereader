//废弃不用

/* function toast(){
    console.log("toast()函数被调用")
    if(document.getElementById("toast") == null){
        var toast = document.createElement("div")
        toast.id = "toast"
        toast.innerHTML = "📚 成功导出到剪贴板"
        toast.style.cssText = "position: fixed;background-color: rgb(33, 150, 243);color: rgb(255, 255, 255);border-radius: 6px;padding: 6px 15px;display: none;text-align: center;margin: 80px auto 0px;left: 50%;transform: translateX(-50%);z-index: 99999;font-size: 120%;"
        var body = document.getElementsByClassName("wr_Windows wr_Desktop wr_page_reader wr_whiteTheme")[0]
        var firstNodeInBody = body.childNodes[0]
        body.insertBefore(toast,firstNodeInBody)
        toast.style.display = "block"
        setTimeout(function () {
            var toast = document.getElementById("toast")
            toast.style.display = "none"
        }, 2000);
    }else{
        document.getElementById("toast").style.display = "block"
        setTimeout(function () {
            var toast = document.getElementById("toast")
            toast.style.display = "none"
        }, 2000);
    }
}
console.log("inject-toast.js被注入")
toast() */