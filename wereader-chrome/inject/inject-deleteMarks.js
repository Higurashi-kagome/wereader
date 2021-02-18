/* 用于获取删除本章标注 */

//console.log("inject-deleteMarks.js：被注入");
(function(){
    let underlines = document.querySelectorAll('.wr_underline.s0,.wr_underline.s1,.wr_underline.s2');
    let counter = 0;
    underlines.forEach((el)=>{
        counter++;
        setTimeout(() => {
            el.click();
            let deleteBtn = document.getElementsByClassName('toolbarItem removeUnderline')[0];
            if(deleteBtn) deleteBtn.click();
            // 点击包含想法的标注时会弹出想法框，所以点击空白处使其隐藏
            if(document.getElementById('readerReviewDetailPanel')) document.elementFromPoint(0, 0).click();
        }, counter*500);
    });

    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: counter*500,
        timerProgressBar: true
    });
    Toast.fire({
        icon: 'info',
        title: 'Deleting...'
    }).then(()=>{
        let underlines = document.querySelectorAll('.wr_underline.s0,.wr_underline.s1,.wr_underline.s2');
        if(underlines.length){
            Swal.fire({
                title: "Deleted most of the marks.",
                text: "Scroll the marks which didn't delete successfully into view？",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No'
            }).then((result)=>{
                if(result.value) underlines[0].scrollIntoView();
            });
        }else Swal.fire({title: 'Deleted all marks.', icon: "success"});
    });
})()