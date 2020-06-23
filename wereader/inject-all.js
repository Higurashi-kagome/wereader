//获取章内内容（失败，舍弃）
/* function getThisCha(){
    var childs = document.getElementById("renderTargetContent").childNodes
    var minWidth = 100.0
    var lineHeight = 0.0
    //遍历元素获得最小字宽及最小行间距
    for(var i=0,len=childs.length;i<len;i++){
        if(childs[i].tagName == "span"){
            var h = window.getComputedStyle(childs[i], null).lineHeight
            height = parseFloat(h.substr(0, h.length - 2))
            lineHeight = lineHeight>height?height:lineHeight
            var w = childs[i].width
            var width = parseFloat(w.substr(0, w.length - 2))
            minWidth = minWidth>width?width:minWidth
        }
    }
    //获得所有内容
    var contents = []
    //遍历元素
    for(var k=0,len=childs.length;k<len;k++){
        //将所有字添加到contents中
        if(childs[k].tagName == "span"){
            var l = childs[k].left
            var left = parseFloat(l.substr(0, l.length - 2))
            var t = childs[k].top
            var top = parseFloat(t.substr(0, t.length - 2))
            var i = Math.ceil(top/minWidth)
            var j = Math.ceil(left/minWidth)
            contents.push({"word":childs[i].innerHtml,"list":j,"line":i})
        }
    }
    //contents按行排列
    var colId = "line"
    var rank = function(x,y){
        return (x[colId] > y[colId]) ? 1 : -1
    }
    contents.sort(rank)
    //遍历contents获得res
    var lineContents = []
    res = ""
    for(var k1=0,len1=contents.length;k1<len1;k1++){
        lineContents.push(contents[k])
        if(lineContents[lineContents.length].line != lineContents[lineContents.length-1].line){
            lineContents.pop()
            colId = "list"
            lineContents.sort(rank)
            //遍历单行数据
            for(var k2=0,len2=lineContents.length;k2<len2;k2++){
                res += lineContents[k2].word
            }
            res += "\n\n"
        }
        lineContents = []
    }
    console.log(res)
} */

/* console.log("inject-all.js：被注入")
var childs = document.getElementById("renderTargetContent").children
console.log(childs)
//console.log(childs)
var minWidth = 19.6 */
//var lineHeight = 0.0
//遍历元素获得最小字宽及最小行间距
/*for(var i=0,len=childs.length;i<len;i++){
    if(childs[i].tagName == "SPAN"){
        var h = window.getComputedStyle(childs[i], null).lineHeight
        height = parseFloat(h.substr(0, h.length - 2))
        lineHeight = lineHeight>height?height:lineHeight
        var w = childs[i].style.width
        var width = parseFloat(w.substr(0, w.length - 2))
        minWidth = minWidth>width?width:minWidth
    }
}*/
//console.log(minWidth)
//console.log(lineHeight)
//获得所有内容
/* var contents = []
//遍历元素
for(var k=0,len=childs.length;k<len;k++){
    //console.log(childs[k].tagName)
    //将所有字添加到contents中
    if(childs[k].tagName == "SPAN"){
        //console.log(childs[k])
        var l = childs[k].style.left
        //console.log(l)
        var left = parseFloat(l.substr(0, l.length - 2))
        var t = childs[k].style.top
        var topA = parseFloat(t.substr(0, t.length - 2))
        var i = Math.ceil(topA/minWidth)
        //console.log(i)
        var j = Math.ceil(left/minWidth)
        contents.push({"word":childs[k].innerHTML,"list":j,"line":i})
    }
}
//console.log(contents)
var colId = "line"
var rank = function(x,y){
    return (x[colId] > y[colId]) ? 1 : -1
}
contents.sort(rank)
console.log(contents)
//遍历contents获得res
var lineContents = []
res = ""
for(var k1=0,len1=contents.length;k1<len1;k1++){
    //console.log(contents[k1])
    lineContents.push(contents[k1])
    //console.log(lineContents[0])
    if(lineContents.length>=2 && (lineContents[lineContents.length-1].line != lineContents[lineContents.length-2].line)){
        lineContents.pop()
        colId = "list"
        lineContents.sort(rank)
        //遍历单行数据
        for(var k2=0,len2=lineContents.length;k2<len2;k2++){
            res += lineContents[k2].word
        }
        res += "\n\n"
        lineContents = []
    }
}
console.log(res) */