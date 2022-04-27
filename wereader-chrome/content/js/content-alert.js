/*用于借助于 sweetalert2 来生成弹窗通知。*/
chrome.runtime.onMessage.addListener(function(msg,sender,sendResponse){
    if(!msg.isAlertMsg) return;
    mySweetAlert(msg)
    // 用于表明读书页开启，正常调用 sweetalert2
    sendResponse({succ: 1});
});

/* sweetAlert2 弹窗通知。msg.alertMsg.icon 为 success 或 warning 类型时，
比如 msg={icon: 'success',title: '复制成功'}
将在右上角弹出小方框，否则根据 msg.alertMsg 的配置来弹窗，
比如 msg={title: "复制出错", text: JSON.stringify(e), confirmButtonText: '确定',icon: "error"}
*/
function mySweetAlert(msg) {
	if(msg.alertMsg && (msg.alertMsg.icon == 'success' || msg.alertMsg.icon == 'warning')){
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
}