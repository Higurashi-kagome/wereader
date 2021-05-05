/*用于借助于 sweetalert2 来生成通知*/

//console.log("content-alert.js：被注入")
chrome.runtime.onMessage.addListener(function(msg,sender,sendResponse){
    if(!msg.isAlertMsg) return;
    if(msg.alertMsg.icon == 'success' || msg.alertMsg.icon == 'warning'){
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1500,
            onOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        });
        Toast.fire(msg.alertMsg);
    }else{//其他消息
        Swal.fire(msg.alertMsg);
    }
    // 用于表明读书页开启，正常调用 sweetalert2
    sendResponse({succ: 1});
})