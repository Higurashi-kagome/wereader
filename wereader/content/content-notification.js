//console.log("content-notification.js：被注入")
//生成通知
chrome.runtime.onMessage.addListener(function(msg){
    if(msg.isAlertMsg == true){
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
            })
            Toast.fire(msg.alertMsg)
        }else{
            Swal.fire(msg.alertMsg)
        }
    }
})