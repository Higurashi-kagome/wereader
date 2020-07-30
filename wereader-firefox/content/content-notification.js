//console.log("content-notification.js：被注入")
//生成通知

chrome.runtime.onMessage.addListener(function(msg){
    if(msg.isAlertMsg == true){
        swal(msg.alertMsg)
    }
})