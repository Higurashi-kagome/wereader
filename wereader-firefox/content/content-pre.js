/*当检测到读书页中存在代码块时，提示不要在网页中对代码块进行标注*/
console.log("content-pre.js：被注入")
var pre = document.getElementsByTagName("pre")
setTimeout(function(){
    if(pre.length > 0){
        swal({inco:"warning", text:"检测到该书中包含代码块，因为种种原因，请不要在网页版微信读书上单独标注代码块，因为在网页中标注的代码块不能够被正常导出，且有可能导致你无法正常导出本章标注中被单独标注的图片（如果你的本章标注内容中包含被单独标注的图片的话）。\n如果想导出代码块内容：\n一、可以在手机上对代码内容进行标注，\n二、可以借助“开启复制按钮”功能手动复制。", button: {text: "确定"}})
    }
},2000)