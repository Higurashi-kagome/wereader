import $ from 'jquery'
/* prompt 弹窗初始化 */
function initPrompt() {
    // prompt 取消
    $('#promptCancelButton')[0].onclick = function () {
        $('#promptInput').val('').attr('placeholder', '')
        $('#promptContainer').css('display', 'none')
    }
    // 监听按键
    $('#promptInput')[0].onkeyup = event => {
        if (event.code === 'Enter') {
            // Enter 确定
            console.log('#promptInput Enter keyup')
            $('#promptConfirmButton').trigger('click')
        } else if (event.code === 'Escape') {
            // Escape 取消
            $('#promptCancelButton').trigger('click')
        }
    }
}

export { initPrompt }
