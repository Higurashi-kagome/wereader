/*获取被标注的图片的Markdown文本数组，用于支持导出被标注的图片*/
//发送消息给后台
function setMesToBg(imgsArray){
    chrome.runtime.sendMessage({type: "imgsArr", RimgsArr: imgsArray});
}

//获取imgs数组
function requestImgsArray(imgs,s0,s1,s2){
    var imgsArray = []
    //遍历imgs元素
    for(var i=0,len=imgs.length;i<len;i=i+1){
        var s = imgs[i].getAttribute("data-src")
        if(s == null || s == ""){
            Swal.fire({title: "Oops...",html: "requestImgsArray()：<br>图片链接获取失败。",icon: "error"})
            return
        }
        var l = imgs[i].style.left
        var t = imgs[i].style.top
        var w = imgs[i].style.width
        var h = imgs[i].style.height
        var leftImg = parseFloat(l.substr(0, l.length - 2))
        var topImg = parseFloat(t.substr(0, t.length - 2))
        var widthImg = parseFloat(w.substr(0, w.length - 2))
        var heightImg = parseFloat(h.substr(0, h.length - 2))
        //遍历标注元素更新 imgArray，根据标注元素与图片在网站中的位置来判断图片是否被标注
        function ergodic(markElements){
            for(var j=0,len2=markElements.length;j<len2;j++){
                var leftDiv = parseFloat(markElements[j].style.left.substr(0, markElements[j].style.left.length - 2))
                var topDiv = parseFloat(markElements[j].style.top.substr(0, markElements[j].style.top.length - 2))
                var widthDiv = parseFloat(markElements[j].style.width.substr(0, markElements[j].style.width.length - 2))
                var heightDiv = parseFloat(markElements[j].style.height.substr(0, markElements[j].style.height.length - 2))
                if(Math.abs(leftImg - leftDiv)<=0.1 && Math.abs(topImg - topDiv)<=0.1 && Math.abs(widthImg - widthDiv)<=0.1 && Math.abs(heightImg - heightDiv)<=0.1){
                    imgsArray.push("![" + s.split("/").pop() + "](" + s + ")")
                    return 1
                }
            }
            return 0
        }
        //遍历各级别标注
        if(!ergodic(s0)){
            if(!ergodic(s1)){
                ergodic(s2)
            }
            
        }
    }
    return imgsArray.length==0?["noImg"]:imgsArray //页面中没有图片则返回["noImg"]，否则返回imgsArray
}

//入口
function main(){
    //获取正文所有图片
    var imgs = document.getElementById("renderTargetContent").getElementsByTagName("img");
    var s0 = document.getElementsByClassName("wr_underline s0");
    var s1 = document.getElementsByClassName("wr_underline s1");
    var s2 = document.getElementsByClassName("wr_underline s2");
    var imgsArray = requestImgsArray(imgs,s0,s1,s2);
    setMesToBg(imgsArray)
}

//console.log("inject-copyImgs.js：被注入")
main()