console.log("content-notification.js：被注入")
//生成通知

chrome.runtime.onMessage.addListener(function(msg){
    console.log("content-notification.js：收到消息：" + JSON.stringify(msg))
    if(msg.notificationText != undefined && msg.type == undefined){
        swal(msg.notificationText) //普通通知（只包含正文文字）
    }else if(msg.notificationTitle != undefined && msg.notificationText != undefined && msg.type != undefined){
        swal(msg.notificationTitle, msg.notificationText, msg.type) //带类型、标题及正文的通知
    }
})