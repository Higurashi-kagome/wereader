/* 用于获取删除本章标注 */

//console.log("content-deleteBookmarks.js：被注入");
chrome.runtime.onMessage.addListener((msg)=>{
    if(!msg.deleteBookmarks) return;
    let inser = '本章';
    if(msg.isAll) inser = '全书';
    Swal.fire({
        icon: 'warning',
        title: `删除${inser}标注？`,
        showCancelButton: true,
        confirmButtonText: '是',
        cancelButtonText: '不了'
    }).then((confirm)=>{
        chrome.runtime.sendMessage({type: 'deleteBookmarks',confirm: confirm.value,isAll: msg.isAll});
        if(!confirm.value) return;
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
    });
});
