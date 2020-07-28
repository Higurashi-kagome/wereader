console.log("content-copy.js：被注入")
//生成复制窗口
if(document.getElementById("copyTextBtn") == undefined){
    //创建父元素
    var parentElement = document.createElement("div")
    parentElement.id = "copy_window"
    parentElement.style.cssText = "top: 72.8px;left: 0px;position: fixed;background-color:rgb(255, 255, 255);border-bottom-color:rgb(221, 221, 221);border-bottom-left-radius:0px;border-bottom-right-radius:0px;border-bottom-style:solid;border-bottom-width:1px;border-image-outset:0;border-image-repeat:stretch;border-image-slice:100%;border-image-source:none;border-image-width:1;border-left-color:rgb(221, 221, 221);border-left-style:solid;border-left-width:1px;border-right-color:rgb(221, 221, 221);border-right-style:solid;border-right-width:1px;border-top-color:rgb(221, 221, 221);border-top-left-radius:4px;border-top-right-radius:4px;border-top-style:solid;border-top-width:1px;box-sizing:border-box;color:rgb(51, 51, 51);display:inline-block;font-family:lato, sans-serif;font-size:13px;font-stretch:100%;font-style:normal;font-variant-caps:normal;font-variant-east-asian:normal;font-variant-ligatures:normal;font-variant-numeric:normal;font-weight:400;height:auto;line-height:18.2px;margin-bottom:0px;margin-left:0px;margin-right:0px;margin-top:15px;max-height: 600px;padding-bottom:39px;padding-left:19px;padding-right:19px;padding-top:39px;text-size-adjust:100%;width:auto;z-index:100;"
    //创建子元素1：textarea元素
    var textArea = document.createElement("textarea")
    textArea.id = "area_text"
    textArea.style.cssText = 'appearance:none;background-color:rgb(255, 255, 255);background-position-x:calc(100% - 8px);background-position-y:50%;background-repeat-x:;background-repeat-y:;border-bottom-color:rgb(204, 204, 204);border-bottom-left-radius:3px;border-bottom-right-radius:3px;border-bottom-style:solid;border-bottom-width:1px;border-image-outset:0;border-image-repeat:stretch;border-image-slice:100%;border-image-source:none;border-image-width:1;border-left-color:rgb(204, 204, 204);border-left-style:solid;border-left-width:1px;border-right-color:rgb(204, 204, 204);border-right-style:solid;border-right-width:1px;border-top-color:rgb(204, 204, 204);border-top-left-radius:3px;border-top-right-radius:3px;border-top-style:solid;border-top-width:1px;box-shadow:rgba(0, 0, 0, 0.075) 0px 1px 2px 0px inset;box-sizing:border-box;color:rgb(51, 51, 51);cursor:text;display:inline-block;flex-direction:column;font-family:Helvetica, arial, nimbussansl, liberationsans, freesans, clean, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol";font-size:13px;font-stretch:100%;font-style:normal;font-variant-caps:normal;font-variant-east-asian:normal;font-variant-ligatures:normal;font-variant-numeric:normal;font-weight:400;height:400px;letter-spacing:normal;line-height:18.2px;margin-bottom:0px;margin-left:0px;margin-right:0px;margin-top:0px;min-height:34px;outline-color:rgb(51, 51, 51);outline-style:none;outline-width:0px;overflow-wrap:break-word;overflow-x:auto;overflow-y:auto;padding-bottom:7px;padding-left:8px;padding-right:8px;padding-top:7px;resize:both;text-align:start;text-indent:0px;text-rendering:auto;text-shadow:none;text-size-adjust:100%;text-transform:none;vertical-align:middle;white-space:pre-wrap;width:180px;word-spacing:0px;writing-mode:horizontal-tb;-webkit-rtl-ordering:logical;-webkit-border-image:none;z-index:101;position: relative'
    //创建子元素2：div元素 btnContainer————按钮的容器
    var btnContainer = document.createElement("div")
    //创建按钮1：copy
    var copyBtn = document.createElement("button")
    copyBtn.className = "btn"
    copyBtn.style.cssText = 'float: left;align-items:flex-start;appearance:none;background-color:rgb(238, 238, 238);background-image:linear-gradient(rgb(252, 252, 252), rgb(238, 238, 238));border-bottom-color:rgb(213, 213, 213);border-bottom-left-radius:3px;border-bottom-right-radius:3px;border-bottom-style:solid;border-bottom-width:1px;border-image-outset:0;border-image-repeat:stretch;border-image-slice:100%;border-image-source:none;border-image-width:1;border-left-color:rgb(213, 213, 213);border-left-style:solid;border-left-width:1px;border-right-color:rgb(213, 213, 213);border-right-style:solid;border-right-width:1px;border-top-color:rgb(213, 213, 213);border-top-left-radius:3px;border-top-right-radius:3px;border-top-style:solid;border-top-width:1px;box-sizing:border-box;color:rgb(51, 51, 51);cursor:pointer;display:block;font-family:Helvetica, arial, nimbussansl, liberationsans, freesans, clean, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol";font-size:13px;font-stretch:100%;font-style:normal;font-variant-caps:normal;font-variant-east-asian:normal;font-variant-ligatures:normal;font-variant-numeric:normal;font-weight:700;height:auto;letter-spacing:normal;line-height:20px;margin-bottom:0px;margin-left:0px;margin-right:0px;margin-top:0px;opacity:1;overflow-x:visible;overflow-y:visible;padding-bottom:2px;padding-left:6px;padding-right:6px;padding-top:2px;  text-align:center;text-indent:0px;text-rendering:auto;text-shadow:none;text-size-adjust:100%;text-transform:none;  transition-delay:0s;transition-duration:0.3s;transition-property:opacity;transition-timing-function:ease-in-out;user-select:none;vertical-align:middle;white-space:nowrap;width:auto;word-spacing:0px;writing-mode:horizontal-tb;-webkit-border-image:none;'
    copyBtn.setAttribute("data-clipboard-target","#area_text")
    //创建按钮2：close
    var closeBtn = document.createElement("button")
    closeBtn.style.cssText = 'float: auto;align-items:flex-start;appearance:none;background-color:rgb(238, 238, 238);background-image:linear-gradient(rgb(252, 252, 252), rgb(238, 238, 238));border-bottom-color:rgb(213, 213, 213);border-bottom-left-radius:3px;border-bottom-right-radius:3px;border-bottom-style:solid;border-bottom-width:1px;border-image-outset:0;border-image-repeat:stretch;border-image-slice:100%;border-image-source:none;border-image-width:1;border-left-color:rgb(213, 213, 213);border-left-style:solid;border-left-width:1px;border-right-color:rgb(213, 213, 213);border-right-style:solid;border-right-width:1px;border-top-color:rgb(213, 213, 213);border-top-left-radius:3px;border-top-right-radius:3px;border-top-style:solid;border-top-width:1px;box-sizing:border-box;color:rgb(51, 51, 51);cursor:pointer;display:block;font-family:Helvetica, arial, nimbussansl, liberationsans, freesans, clean, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol";font-size:13px;font-stretch:100%;font-style:normal;font-variant-caps:normal;font-variant-east-asian:normal;font-variant-ligatures:normal;font-variant-numeric:normal;font-weight:700;height:auto;letter-spacing:normal;line-height:20px;margin-bottom:0px;margin-left:0px;margin-right:0px;margin-top:0px;opacity:1;overflow-x:visible;overflow-y:visible;padding-bottom:2px;padding-left:6px;padding-right:6px;padding-top:2px;  text-align:center;text-indent:0px;text-rendering:auto;text-shadow:none;text-size-adjust:100%;text-transform:none;  transition-delay:0s;transition-duration:0.3s;transition-property:opacity;transition-timing-function:ease-in-out;user-select:none;vertical-align:middle;white-space:nowrap;width:auto;word-spacing:0px;writing-mode:horizontal-tb;-webkit-border-image:none;'
    //给各按钮添加不同的文字及点击事件
    var p1 = document.createElement("p")
    p1.textContent = "copy"
    var p2 = document.createElement("p")
    p2.textContent = "close"
    copyBtn.appendChild(p1)
    closeBtn.appendChild(p2)
    closeBtn.addEventListener("click", function(){
        this.parentNode.parentNode.style.display = "none"
    })
    //子元素追加到父元素
    btnContainer.appendChild(copyBtn)
    btnContainer.appendChild(closeBtn)
    parentElement.appendChild(textArea)
    parentElement.appendChild(btnContainer)
    document.body.appendChild(parentElement)
}

//监听信息，收到信息后设置内容并显示复制窗口
chrome.runtime.onMessage.addListener(function(msg){
    console.log("content-copy.js：收到消息：" + JSON.stringify(msg))
    if(msg.isCopyMsg == true){
        var textArea = document.getElementById("area_text")
        textArea.textContent = msg.text;
        var clipboard = new Clipboard('.btn')
        clipboard.on('success', function (e) {
            swal({title:"复制成功！",icon: "success",button: {text: "确定"}})
        });
        clipboard.on('error', function (e) {
            swal({title:"复制出错:",icon: "error",text: JSON.stringify(e),button: {text: "确定"}})
        });
        textArea.parentNode.style.display = "inline-block"
    }
})