/* 用于获取删除本章标注 */

//console.log("inject-deleteMarks.js：被注入");
Swal.fire({
    icon: 'warning',
    title: '删除本章标注？',
    showCancelButton: true,
    confirmButtonText: '是',
    cancelButtonText: '不了'
}).then((confirm)=>{
        if(!confirm.value) return;
        let underlines = document.querySelectorAll('.wr_underline.s0,.wr_underline.s1,.wr_underline.s2');
        for (var i = 0; i < underlines.length; i++) {
            const el = underlines[i];
            setTimeout(() => {
                el.click();
                let deleteBtn = document.getElementsByClassName('toolbarItem removeUnderline')[0];
                if(deleteBtn) deleteBtn.click();
                // 点击包含想法的标注时会弹出想法框，所以点击空白处使其隐藏
                if(document.getElementById('readerReviewDetailPanel')) document.elementFromPoint(0, 0).click();
            }, i*500);
        }

        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: i*500,
            timerProgressBar: true
        });
        Toast.fire({
            icon: 'info',
            title: '正在删除...'
        }).then(()=>{
            let underlines = document.querySelectorAll('.wr_underline.s0,.wr_underline.s1,.wr_underline.s2');
            if(underlines.length){
                Swal.fire({
                    title: "大部分标注成功删除",
                    text: "跳转至未成功删除的标注？",
                    icon: "question",
                    showCancelButton: true,
                    confirmButtonText: '好',
                    cancelButtonText: '不了'
                }).then((result)=>{
                    if(result.value) underlines[0].scrollIntoView();
                });
            }else Swal.fire({title: '标注已删除', icon: "success"});
        });
})